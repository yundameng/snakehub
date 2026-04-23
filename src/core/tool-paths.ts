import os from "node:os";
import path from "node:path";
import { getAdapterOrThrow, TOOL_ADAPTERS } from "./adapters";
import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import { readJsonFile, writeJsonFile } from "./fs-utils";
import { ResourceType } from "./types";

export type ToolPathOverrides = Record<string, Partial<Record<ResourceType, string>>>;

export interface EffectiveToolPathEntry {
  toolId: string;
  toolName: string;
  type: ResourceType;
  path?: string;
  source: "default" | "override" | "project" | "disabled";
}

function expandHome(inputPath: string): string {
  if (inputPath === "~") {
    return os.homedir();
  }
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

function normalizePath(inputPath: string): string {
  return path.resolve(expandHome(inputPath));
}

export async function loadToolPathOverrides(root = getHubRoot()): Promise<ToolPathOverrides> {
  await ensureHubLayout(root);
  const filePath = hubPaths(root).toolPaths;
  return readJsonFile<ToolPathOverrides>(filePath, {});
}

async function saveToolPathOverrides(overrides: ToolPathOverrides, root = getHubRoot()): Promise<void> {
  const filePath = hubPaths(root).toolPaths;
  await writeJsonFile(filePath, overrides);
}

export async function resolveTargetDir(
  toolId: string,
  type: ResourceType,
  root = getHubRoot(),
  projectPath?: string,
): Promise<{ path?: string; source: "default" | "override" | "project" | "disabled" }> {
  const adapter = getAdapterOrThrow(toolId);
  if (!adapter.supports.includes(type)) {
    return { source: "disabled" };
  }

  if (projectPath && projectPath.trim()) {
    const scopedBase = path.resolve(projectPath.trim(), adapter.configDirName);
    return { path: path.join(scopedBase, type), source: "project" };
  }

  const overrides = await loadToolPathOverrides(root);
  const overrideValue = overrides[toolId]?.[type];
  if (overrideValue && overrideValue.trim()) {
    return { path: normalizePath(overrideValue), source: "override" };
  }

  const defaultEnabled = adapter.defaultEnabledTypes ?? adapter.supports;
  if (!defaultEnabled.includes(type)) {
    return { source: "disabled" };
  }

  return { path: adapter.targetDir(type), source: "default" };
}

export async function setToolPathOverride(input: {
  toolId: string;
  type: ResourceType;
  targetPath: string;
  root?: string;
}): Promise<string> {
  const root = input.root ?? getHubRoot();
  const adapter = getAdapterOrThrow(input.toolId);
  if (!adapter.supports.includes(input.type)) {
    throw new Error(`Tool '${adapter.id}' does not support type '${input.type}'.`);
  }

  const normalized = normalizePath(input.targetPath);
  const overrides = await loadToolPathOverrides(root);
  const next = {
    ...overrides,
    [input.toolId]: {
      ...(overrides[input.toolId] ?? {}),
      [input.type]: normalized,
    },
  };
  await saveToolPathOverrides(next, root);
  return normalized;
}

export async function unsetToolPathOverride(input: {
  toolId: string;
  type: ResourceType;
  root?: string;
}): Promise<void> {
  const root = input.root ?? getHubRoot();
  const overrides = await loadToolPathOverrides(root);
  const current = overrides[input.toolId];
  if (!current) {
    return;
  }

  const { [input.type]: _removed, ...rest } = current;
  const next = { ...overrides };
  if (Object.keys(rest).length === 0) {
    delete next[input.toolId];
  } else {
    next[input.toolId] = rest;
  }

  await saveToolPathOverrides(next, root);
}

export async function getEffectiveToolPathEntries(
  root = getHubRoot(),
  projectPath?: string,
): Promise<EffectiveToolPathEntry[]> {
  const entries: EffectiveToolPathEntry[] = [];
  for (const adapter of TOOL_ADAPTERS) {
    for (const type of adapter.supports) {
      const resolved = await resolveTargetDir(adapter.id, type, root, projectPath);
      entries.push({
        toolId: adapter.id,
        toolName: adapter.name,
        type,
        path: resolved.path,
        source: resolved.source,
      });
    }
  }
  return entries;
}
