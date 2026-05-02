import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import { readJsonFile, writeJsonFile } from "./fs-utils";

export interface DocsWritebackConfig {
  projectPath: string;
}

const DEFAULT_CONFIG: DocsWritebackConfig = {
  projectPath: "",
};

export async function loadDocsWritebackConfig(root = getHubRoot()): Promise<DocsWritebackConfig> {
  await ensureHubLayout(root);
  const filePath = hubPaths(root).docsWriteback;
  const config = await readJsonFile<DocsWritebackConfig>(filePath, DEFAULT_CONFIG);
  return {
    projectPath: String(config.projectPath || "").trim(),
  };
}

export async function saveDocsWritebackConfig(input: DocsWritebackConfig, root = getHubRoot()): Promise<DocsWritebackConfig> {
  await ensureHubLayout(root);
  const filePath = hubPaths(root).docsWriteback;
  const next = {
    projectPath: String(input.projectPath || "").trim(),
  };
  await writeJsonFile(filePath, next);
  return next;
}
