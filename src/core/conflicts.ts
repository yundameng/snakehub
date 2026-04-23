import { getHubRoot } from "./config";
import { scanTools } from "./scanner";
import { ResourceType, ScanAsset } from "./types";

export type ConflictOrder = "project_first" | "global_first" | "unknown";

export interface ProjectGlobalConflict {
  id: string;
  toolId: string;
  toolName: string;
  type: ResourceType;
  name: string;
  fingerprint: string;
  projectAssetPath: string;
  globalAssetPath: string;
  projectTimeMs?: number;
  globalTimeMs?: number;
  order: ConflictOrder;
  firstPath?: string;
  laterPath?: string;
}

function chooseTimeMs(asset: ScanAsset): number | undefined {
  if (asset.birthtimeMs && asset.birthtimeMs > 0) {
    return asset.birthtimeMs;
  }
  if (asset.mtimeMs && asset.mtimeMs > 0) {
    return asset.mtimeMs;
  }
  return undefined;
}

function resolveOrder(projectTimeMs?: number, globalTimeMs?: number): ConflictOrder {
  if (!projectTimeMs || !globalTimeMs || projectTimeMs === globalTimeMs) {
    return "unknown";
  }
  return projectTimeMs < globalTimeMs ? "project_first" : "global_first";
}

export async function detectProjectGlobalConflicts(input: {
  projectPath?: string;
  toolId?: string;
  type?: ResourceType;
  root?: string;
}): Promise<ProjectGlobalConflict[]> {
  const root = input.root ?? getHubRoot();
  const projectPath = input.projectPath?.trim();
  if (!projectPath) {
    return [];
  }

  const [projectScan, globalScan] = await Promise.all([scanTools(root, projectPath), scanTools(root)]);
  const globalByKey = new Map<string, Array<{ path: string; name: string; timeMs?: number }>>();

  for (const tool of globalScan) {
    if (!tool.detected) {
      continue;
    }
    if (input.toolId && tool.toolId !== input.toolId) {
      continue;
    }
    for (const asset of tool.assets) {
      if (input.type && asset.type !== input.type) {
        continue;
      }
      const key = `${tool.toolId}|${asset.type}|${asset.fingerprint}`;
      const list = globalByKey.get(key) ?? [];
      list.push({
        path: asset.path,
        name: asset.name,
        timeMs: chooseTimeMs(asset),
      });
      globalByKey.set(key, list);
    }
  }

  const conflicts: ProjectGlobalConflict[] = [];

  for (const tool of projectScan) {
    if (!tool.detected) {
      continue;
    }
    if (input.toolId && tool.toolId !== input.toolId) {
      continue;
    }

    for (const asset of tool.assets) {
      if (input.type && asset.type !== input.type) {
        continue;
      }

      const key = `${tool.toolId}|${asset.type}|${asset.fingerprint}`;
      const globalMatches = globalByKey.get(key);
      if (!globalMatches || globalMatches.length === 0) {
        continue;
      }

      const preferred = globalMatches.find((item) => item.name === asset.name) ?? globalMatches[0];
      if (!preferred || preferred.path === asset.path) {
        continue;
      }

      const projectTimeMs = chooseTimeMs(asset);
      const globalTimeMs = preferred.timeMs;
      const order = resolveOrder(projectTimeMs, globalTimeMs);
      const firstPath =
        order === "project_first"
          ? asset.path
          : order === "global_first"
            ? preferred.path
            : undefined;
      const laterPath =
        order === "project_first"
          ? preferred.path
          : order === "global_first"
            ? asset.path
            : undefined;

      conflicts.push({
        id: `${tool.toolId}:${asset.type}:${asset.fingerprint}:${asset.path}:${preferred.path}`,
        toolId: tool.toolId,
        toolName: tool.toolName,
        type: asset.type,
        name: asset.name,
        fingerprint: asset.fingerprint,
        projectAssetPath: asset.path,
        globalAssetPath: preferred.path,
        projectTimeMs,
        globalTimeMs,
        order,
        firstPath,
        laterPath,
      });
    }
  }

  conflicts.sort((a, b) =>
    `${a.toolId}|${a.type}|${a.name}|${a.projectAssetPath}`.localeCompare(
      `${b.toolId}|${b.type}|${b.name}|${b.projectAssetPath}`,
    ),
  );
  return conflicts;
}
