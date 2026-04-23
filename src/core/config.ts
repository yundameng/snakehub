import os from "node:os";
import path from "node:path";
import { ensureDir } from "./fs-utils";

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
  return {
    root,
    store: path.join(root, "store"),
    skillsStore: path.join(root, "store", "skills"),
    hooksStore: path.join(root, "store", "hooks"),
    agentsStore: path.join(root, "store", "agents"),
    commandsStore: path.join(root, "store", "commands"),
    links: path.join(root, "links"),
    repos: path.join(root, "repos"),
    db: path.join(root, "db"),
    backups: path.join(root, "backups"),
    logs: path.join(root, "logs"),
    state: path.join(root, "db", "state.json"),
    toolPaths: path.join(root, "db", "tool-paths.json"),
  };
}

export async function ensureHubLayout(root = getHubRoot()): Promise<void> {
  const p = hubPaths(root);
  await ensureDir(p.root);
  await ensureDir(p.store);
  await ensureDir(p.skillsStore);
  await ensureDir(p.hooksStore);
  await ensureDir(p.agentsStore);
  await ensureDir(p.commandsStore);
  await ensureDir(p.links);
  await ensureDir(p.repos);
  await ensureDir(p.db);
  await ensureDir(p.backups);
  await ensureDir(p.logs);
}
