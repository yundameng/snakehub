import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { copyRecursive, ensureDir, pathExists, removePath } from "./fs-utils";

export const HUB_ENV = "SNAKEHUB_HOME";
export const LEGACY_HUB_ENV = "COWHUB_HOME";

export function getHubRoot(): string {
  const fromEnv = process.env[HUB_ENV] || process.env[LEGACY_HUB_ENV];
  if (fromEnv && fromEnv.trim()) {
    return path.resolve(fromEnv);
  }
  return path.join(os.homedir(), ".snakehub");
}

export function hubPaths(root = getHubRoot()) {
  const storeRuntime = path.join(root, "store-runtime");
  const storeSource = path.join(root, "store-source");
  return {
    root,
    // `store` is kept as runtime store alias for backward compatibility.
    store: storeRuntime,
    storeRuntime,
    storeSource,
    skillsStore: path.join(storeRuntime, "skills"),
    hooksStore: path.join(storeRuntime, "hooks"),
    agentsStore: path.join(storeRuntime, "agents"),
    commandsStore: path.join(storeRuntime, "commands"),
    rulesStore: path.join(storeRuntime, "rules"),
    links: path.join(root, "links"),
    repos: path.join(root, "repos"),
    db: path.join(root, "db"),
    backups: path.join(root, "backups"),
    logs: path.join(root, "logs"),
    state: path.join(root, "db", "state.json"),
    toolPaths: path.join(root, "db", "tool-paths.json"),
    docsWriteback: path.join(root, "db", "docs-writeback.json"),
    docsWritebackMap: path.join(root, "db", "docs-writeback-map.json"),
  };
}

export async function ensureHubLayout(root = getHubRoot()): Promise<void> {
  const p = hubPaths(root);
  const legacyStore = path.join(root, "store");

  await ensureDir(p.root);
  if ((await pathExists(legacyStore)) && !(await pathExists(p.storeRuntime))) {
    try {
      await fs.rename(legacyStore, p.storeRuntime);
    } catch {
      await ensureDir(p.storeRuntime);
      const entries = await fs.readdir(legacyStore, { withFileTypes: true });
      for (const entry of entries) {
        const from = path.join(legacyStore, entry.name);
        const to = path.join(p.storeRuntime, entry.name);
        await copyRecursive(from, to);
      }
      await removePath(legacyStore);
    }
  }

  await ensureDir(p.storeRuntime);
  await ensureDir(p.storeSource);
  const sourceEntries = await fs.readdir(p.storeSource).catch(() => []);
  if (sourceEntries.length === 0) {
    const runtimeEntries = await fs.readdir(p.storeRuntime, { withFileTypes: true }).catch(() => []);
    for (const entry of runtimeEntries) {
      const from = path.join(p.storeRuntime, entry.name);
      const to = path.join(p.storeSource, entry.name);
      await copyRecursive(from, to);
    }
  }
  await ensureDir(p.skillsStore);
  await ensureDir(p.hooksStore);
  await ensureDir(p.agentsStore);
  await ensureDir(p.commandsStore);
  await ensureDir(p.rulesStore);
  await ensureDir(p.links);
  await ensureDir(p.repos);
  await ensureDir(p.db);
  await ensureDir(p.backups);
  await ensureDir(p.logs);
}
