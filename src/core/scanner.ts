import fs from "node:fs/promises";
import path from "node:path";
import { TOOL_ADAPTERS } from "./adapters";
import { pathExists } from "./fs-utils";
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
    if (projectPath && projectPath.trim()) {
      const scopedBase = path.resolve(projectPath.trim(), adapter.configDirName);
      detected = detected || (await pathExists(scopedBase));
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
