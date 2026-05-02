import fs from "node:fs/promises";
import path from "node:path";
import { getHubRoot } from "./config";
import { pathExists, removePath } from "./fs-utils";
import { resolveResourceOrThrow } from "./linker";
import { loadState, newId, nowIso, pushOperation, saveState } from "./state";

function resolveLinkedTarget(linkPath: string, rawTarget: string): string {
  if (path.isAbsolute(rawTarget)) {
    return path.resolve(rawTarget);
  }
  return path.resolve(path.dirname(linkPath), rawTarget);
}

export async function removeResourceFromHub(input: {
  resourceToken: string;
  root?: string;
}): Promise<{
  operationId: string;
  resourceId: string;
  resourceType: string;
  resourceName: string;
  storePath: string;
  removedStorePath: boolean;
  deactivatedMappings: number;
  removedLinks: number;
  skippedLinks: number;
}> {
  const root = input.root ?? getHubRoot();
  const token = String(input.resourceToken || "").trim();
  if (!token) {
    throw new Error("resourceToken is required.");
  }

  let state = await loadState(root);
  const resource = resolveResourceOrThrow(state, token);
  const resolvedStorePath = path.resolve(resource.storePath);
  const relatedActiveMappings = state.mappings.filter((mapping) => mapping.resourceId === resource.id && mapping.active);

  let removedLinks = 0;
  let skippedLinks = 0;
  for (const mapping of relatedActiveMappings) {
    const linkPath = String(mapping.linkPath || "");
    if (!linkPath || !(await pathExists(linkPath))) {
      continue;
    }
    let shouldRemoveLink = false;
    try {
      const stat = await fs.lstat(linkPath);
      if (stat.isSymbolicLink()) {
        const rawTarget = await fs.readlink(linkPath);
        const resolvedTarget = resolveLinkedTarget(linkPath, rawTarget);
        shouldRemoveLink = resolvedTarget === resolvedStorePath;
      }
    } catch {
      shouldRemoveLink = false;
    }

    if (!shouldRemoveLink) {
      skippedLinks += 1;
      continue;
    }

    await removePath(linkPath);
    removedLinks += 1;
  }

  let removedStorePath = false;
  if (await pathExists(resolvedStorePath)) {
    await removePath(resolvedStorePath);
    removedStorePath = true;
  }

  const deactivatedMappings = relatedActiveMappings.length;
  state = {
    ...state,
    resources: state.resources.filter((item) => item.id !== resource.id),
    mappings: state.mappings.map((mapping) => {
      if (mapping.resourceId !== resource.id || !mapping.active) {
        return mapping;
      }
      return { ...mapping, active: false };
    }),
  };

  const operationId = newId("op");
  state = pushOperation(state, {
    id: operationId,
    type: "remove",
    createdAt: nowIso(),
    details: {
      resourceId: resource.id,
      resourceType: resource.type,
      resourceName: resource.name,
      sourcePath: resource.storePath,
      storePath: resource.storePath,
      removedStorePath,
      deactivatedMappings,
      removedLinks,
      skippedLinks,
    },
  });
  await saveState(state, root);

  return {
    operationId,
    resourceId: resource.id,
    resourceType: resource.type,
    resourceName: resource.name,
    storePath: resource.storePath,
    removedStorePath,
    deactivatedMappings,
    removedLinks,
    skippedLinks,
  };
}
