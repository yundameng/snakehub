import fs from "node:fs/promises";
import path from "node:path";
import { getAdapterOrThrow } from "./adapters";
import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import { createDirLink, ensureDir, movePath, pathExists, removePath } from "./fs-utils";
import { loadState, newId, nowIso, pushMapping, pushOperation, saveState } from "./state";
import { resolveTargetDir } from "./tool-paths";
import { MappingRecord, ResourceRecord } from "./types";

function resolveLinkedTarget(linkPath: string, rawTarget: string): string {
  if (path.isAbsolute(rawTarget)) {
    return path.resolve(rawTarget);
  }
  return path.resolve(path.dirname(linkPath), rawTarget);
}

export function resolveResourceOrThrow(state: { resources: ResourceRecord[] }, token: string): ResourceRecord {
  const byId = state.resources.find((r) => r.id === token);
  if (byId) {
    return byId;
  }

  const byName = state.resources.filter((r) => r.name === token);
  if (byName.length === 1) {
    return byName[0];
  }
  if (byName.length > 1) {
    throw new Error(`Resource name '${token}' is ambiguous. Use an id instead.`);
  }

  throw new Error(`Resource '${token}' not found.`);
}

export async function linkResource(input: {
  resourceToken: string;
  toolId: string;
  aliasName?: string;
  projectPath?: string;
  root?: string;
}): Promise<{ mapping: MappingRecord; operationId: string; backupPath?: string; alreadyLinked?: boolean }> {
  const root = input.root ?? getHubRoot();
  await ensureHubLayout(root);
  const paths = hubPaths(root);

  let state = await loadState(root);
  const resource = resolveResourceOrThrow(state, input.resourceToken);
  const adapter = getAdapterOrThrow(input.toolId);

  if (!adapter.supports.includes(resource.type)) {
    throw new Error(`Tool '${adapter.id}' does not support type '${resource.type}'.`);
  }

  const linkName = (input.aliasName ?? resource.name).trim();
  if (!linkName) {
    throw new Error("Link name cannot be empty.");
  }

  const resolvedTarget = await resolveTargetDir(adapter.id, resource.type, root, input.projectPath);
  if (!resolvedTarget.path) {
    throw new Error(
      `Tool '${adapter.id}' type '${resource.type}' has no target directory. Configure it via: snakehub paths set --tool ${adapter.id} --type ${resource.type.slice(0, -1)} --path <dir>`,
    );
  }

  const targetDir = resolvedTarget.path;
  const linkPath = path.join(targetDir, linkName);
  const sourcePath = path.resolve(resource.storePath);

  await ensureDir(targetDir);

  let backupPath: string | undefined;

  if (await pathExists(linkPath)) {
    const stat = await fs.lstat(linkPath);
    if (stat.isSymbolicLink()) {
      const rawTarget = await fs.readlink(linkPath);
      const resolved = resolveLinkedTarget(linkPath, rawTarget);
      if (resolved === sourcePath) {
        const existingMapping = state.mappings.find(
          (m) => m.active && m.linkPath === linkPath && m.resourceId === resource.id && m.toolId === adapter.id,
        );

        if (existingMapping) {
          return { mapping: existingMapping, operationId: "", alreadyLinked: true };
        }
      }
    }

    const nextBackupPath = path.join(paths.backups, `${newId("bak")}_${path.basename(linkPath)}`);
    backupPath = nextBackupPath;
    await movePath(linkPath, nextBackupPath);
  }

  if (await pathExists(linkPath)) {
    await removePath(linkPath);
  }

  await createDirLink(sourcePath, linkPath);

  const mapping: MappingRecord = {
    id: newId("map"),
    resourceId: resource.id,
    toolId: adapter.id,
    linkPath,
    targetPath: sourcePath,
    active: true,
    createdAt: nowIso(),
  };

  const operationId = newId("op");
  state = pushMapping(state, mapping);
  state = pushOperation(state, {
    id: operationId,
    type: "link",
    createdAt: nowIso(),
    details: {
      mappingId: mapping.id,
      resourceId: resource.id,
      toolId: adapter.id,
      linkPath,
      targetPath: sourcePath,
      backupPath,
    },
  });

  await saveState(state, root);

  return { mapping, operationId, backupPath };
}
