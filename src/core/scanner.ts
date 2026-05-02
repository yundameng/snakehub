import fs from "node:fs/promises";
import path from "node:path";
import { TOOL_ADAPTERS } from "./adapters";
import { pathExists, shouldIgnoreName } from "./fs-utils";
import { fingerprintPath } from "./fingerprint";
import { getHubRoot } from "./config";
import { loadState } from "./state";
import { resolveTargetDir } from "./tool-paths";
import { ResourceType, ScanAsset } from "./types";

export interface ToolScanResult {
  detected: boolean;
  toolId: string;
  toolName: string;
  assets: ScanAsset[];
}

const RULE_SUFFIX_BY_TOOL: Record<string, string> = {
  claude: ".md",
  cursor: ".mdc",
  codex: ".rules",
  opencow: ".md",
};

const PROJECT_SCAN_IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "release",
  ".idea",
  ".vscode",
]);

async function collectScopedConfigBases(
  projectRoot: string,
  configDirName: string,
): Promise<string[]> {
  const normalizedRoot = path.resolve(projectRoot);
  const results = new Set<string>();

  async function walk(currentPath: string, depth: number): Promise<void> {
    if (depth > 7) {
      return;
    }
    const entries = await fs.readdir(currentPath, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (entry.name === configDirName) {
        results.add(path.join(currentPath, entry.name));
        continue;
      }
      if (entry.name.startsWith(".") || PROJECT_SCAN_IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      await walk(path.join(currentPath, entry.name), depth + 1);
    }
  }

  await walk(normalizedRoot, 0);
  return [...results];
}

async function hasExpectedRuleFileInDir(
  dirPath: string,
  expectedSuffix: string,
  depth = 0,
): Promise<boolean> {
  if (depth > 6) {
    return false;
  }
  const entries = await fs.readdir(dirPath, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.name.startsWith(".") || shouldIgnoreName(entry.name)) {
      continue;
    }
    const abs = path.join(dirPath, entry.name);
    if (entry.isFile() && entry.name.toLowerCase().endsWith(expectedSuffix)) {
      return true;
    }
    if (entry.isDirectory() && (await hasExpectedRuleFileInDir(abs, expectedSuffix, depth + 1))) {
      return true;
    }
  }
  return false;
}

async function shouldIncludeScannedEntry(input: {
  toolId: string;
  type: ResourceType;
  entry: { name: string; isFile(): boolean; isSymbolicLink(): boolean };
  assetPath: string;
}): Promise<boolean> {
  if (input.type !== "rules") {
    return true;
  }
  const expected = RULE_SUFFIX_BY_TOOL[input.toolId];
  if (!expected) {
    return false;
  }
  if (input.entry.isFile()) {
    return input.entry.name.toLowerCase().endsWith(expected);
  }
  if (!input.entry.isSymbolicLink()) {
    return false;
  }

  const linked = await fs.stat(input.assetPath).catch(() => undefined);
  if (!linked) {
    return false;
  }
  if (linked.isFile()) {
    const resolvedPath = await fs.realpath(input.assetPath).catch(() => input.assetPath);
    return path.basename(resolvedPath).toLowerCase().endsWith(expected);
  }
  if (!linked.isDirectory()) {
    return false;
  }
  return hasExpectedRuleFileInDir(input.assetPath, expected);
}

async function scanTargetDir(
  toolId: string,
  type: ResourceType,
  dirPath: string,
  fingerprintToResourceId: Map<string, string>,
): Promise<ScanAsset[]> {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const assets: ScanAsset[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const assetPath = path.join(dirPath, entry.name);
    if (!(await shouldIncludeScannedEntry({ toolId, type, entry, assetPath }))) {
      continue;
    }
    try {
      const stat = await fs.lstat(assetPath);
      const { fingerprint } = await fingerprintPath(assetPath);
      assets.push({
        toolId,
        type,
        path: assetPath,
        name: entry.name,
        fingerprint,
        duplicateResourceId: fingerprintToResourceId.get(fingerprint),
        mtimeMs: Number.isFinite(stat.mtimeMs) ? stat.mtimeMs : undefined,
        birthtimeMs: Number.isFinite(stat.birthtimeMs) ? stat.birthtimeMs : undefined,
      });
    } catch {
      // Ignore assets that cannot be read safely.
    }
  }

  return assets;
}

export async function scanTools(root = getHubRoot(), projectPath?: string): Promise<ToolScanResult[]> {
  const state = await loadState(root);
  const fingerprintToResourceId = new Map<string, string>();
  for (const resource of state.resources) {
    fingerprintToResourceId.set(resource.fingerprint, resource.id);
  }

  const results: ToolScanResult[] = [];

  for (const adapter of TOOL_ADAPTERS) {
    let detected = await adapter.detect();
    let scopedConfigBases: string[] = [];
    if (projectPath && projectPath.trim()) {
      scopedConfigBases = await collectScopedConfigBases(projectPath.trim(), adapter.configDirName);
      detected = detected || scopedConfigBases.length > 0;
    }
    if (!detected) {
      results.push({
        detected: false,
        toolId: adapter.id,
        toolName: adapter.name,
        assets: [],
      });
      continue;
    }

    const assetsByType = await Promise.all(
      adapter.supports.map(async (type) => {
        if (projectPath && projectPath.trim()) {
          const scopedTypeDirs = await Promise.all(
            scopedConfigBases.map(async (basePath) => {
              const candidate = path.join(basePath, type);
              return (await pathExists(candidate)) ? candidate : "";
            }),
          );
          const dirs = scopedTypeDirs.filter(Boolean);
          if (!dirs.length) {
            return [];
          }
          const scanned = await Promise.all(
            dirs.map((dirPath) => scanTargetDir(adapter.id, type, dirPath, fingerprintToResourceId)),
          );
          return scanned.flat();
        }

        const resolved = await resolveTargetDir(adapter.id, type, root, projectPath);
        if (!resolved.path) {
          return [];
        }
        return scanTargetDir(adapter.id, type, resolved.path, fingerprintToResourceId);
      }),
    );

    results.push({
      detected: true,
      toolId: adapter.id,
      toolName: adapter.name,
      assets: assetsByType.flat(),
    });
  }

  return results;
}
