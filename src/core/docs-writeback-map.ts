import path from "node:path";
import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import { readJsonFile, writeJsonFile } from "./fs-utils";

export interface DocsWritebackSyncGroup {
  groupId: string;
  canonicalBase: string;
  aliases: string[];
  resourceId?: string;
  updatedAt: string;
}

export interface DocsWritebackMapConfig {
  groups: DocsWritebackSyncGroup[];
}

const DEFAULT_CONFIG: DocsWritebackMapConfig = {
  groups: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeRelativeRepoPath(value: string): string {
  return String(value || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export async function loadDocsWritebackMap(root = getHubRoot()): Promise<DocsWritebackMapConfig> {
  await ensureHubLayout(root);
  const filePath = hubPaths(root).docsWritebackMap;
  const config = await readJsonFile<DocsWritebackMapConfig>(filePath, DEFAULT_CONFIG);
  const groups = Array.isArray(config.groups) ? config.groups : [];
  return {
    groups: groups
      .map((group) => ({
        groupId: String(group.groupId || ""),
        canonicalBase: normalizeRelativeRepoPath(group.canonicalBase || ""),
        aliases: Array.isArray(group.aliases)
          ? group.aliases.map((item) => normalizeRelativeRepoPath(item)).filter(Boolean)
          : [],
        resourceId: group.resourceId ? String(group.resourceId) : undefined,
        updatedAt: String(group.updatedAt || ""),
      }))
      .filter((group) => group.groupId && group.canonicalBase),
  };
}

export async function saveDocsWritebackMap(input: DocsWritebackMapConfig, root = getHubRoot()): Promise<void> {
  await ensureHubLayout(root);
  const filePath = hubPaths(root).docsWritebackMap;
  const normalized: DocsWritebackMapConfig = {
    groups: (Array.isArray(input.groups) ? input.groups : [])
      .map((group) => ({
        groupId: String(group.groupId || ""),
        canonicalBase: normalizeRelativeRepoPath(group.canonicalBase || ""),
        aliases: Array.from(
          new Set((Array.isArray(group.aliases) ? group.aliases : []).map((item) => normalizeRelativeRepoPath(item)).filter(Boolean)),
        ),
        resourceId: group.resourceId ? String(group.resourceId) : undefined,
        updatedAt: String(group.updatedAt || nowIso()),
      }))
      .filter((group) => group.groupId && group.canonicalBase),
  };
  await writeJsonFile(filePath, normalized);
}

function fallbackGroupId(canonicalBase: string): string {
  const slug = canonicalBase.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
  return `grp_${slug || "root"}`;
}

export async function upsertDocsWritebackSyncGroup(input: {
  canonicalBase: string;
  aliasBase: string;
  resourceId?: string;
  root?: string;
}): Promise<void> {
  const root = input.root ?? getHubRoot();
  const canonicalBase = normalizeRelativeRepoPath(input.canonicalBase);
  const aliasBase = normalizeRelativeRepoPath(input.aliasBase);
  if (!canonicalBase || !aliasBase || canonicalBase === aliasBase) {
    return;
  }

  const config = await loadDocsWritebackMap(root);
  const existing = config.groups.find((group) => group.canonicalBase === canonicalBase);
  if (existing) {
    if (!existing.aliases.includes(aliasBase)) {
      existing.aliases.push(aliasBase);
    }
    if (input.resourceId) {
      existing.resourceId = input.resourceId;
    }
    existing.updatedAt = nowIso();
    await saveDocsWritebackMap(config, root);
    return;
  }

  config.groups.push({
    groupId: fallbackGroupId(canonicalBase),
    canonicalBase,
    aliases: [aliasBase],
    resourceId: input.resourceId,
    updatedAt: nowIso(),
  });
  await saveDocsWritebackMap(config, root);
}

export function relativeStorePath(absStorePath: string, root = getHubRoot()): string {
  const storeRoot = hubPaths(root).storeRuntime;
  const rel = path.relative(storeRoot, path.resolve(absStorePath));
  return normalizeRelativeRepoPath(rel);
}
