import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { getHubRoot, hubPaths } from "./config";
import { copyRecursive, ensureDir, pathExists } from "./fs-utils";

const IMPORT_RULES_CONFIG_FILES = [
  "setting.json",
  "settings.json",
  "setting.local.json",
  "settings.local.json",
  "cli.json",
  "cli-config.json",
  "config.toml",
];

export const RULES_SIDECAR_FILE_NAMES = ["AGENTS.md", "CLAUDE.md", "CLAUDE.local.md"];

export interface RulesCompanionDetection {
  rulesDir: string;
  baseDir: string;
  companionFiles: string[];
  companionPaths: string[];
}

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const key = name.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(key);
  }
  return result;
}

async function resolveExistingFiles(baseDir: string, fileNames: string[]): Promise<RulesCompanionDetection> {
  const companionFiles: string[] = [];
  const companionPaths: string[] = [];

  for (const fileName of fileNames) {
    const candidatePath = path.join(baseDir, fileName);
    if (!(await pathExists(candidatePath))) {
      continue;
    }
    const isFile = await fs
      .stat(candidatePath)
      .then((item) => item.isFile())
      .catch(() => false);
    if (!isFile) {
      continue;
    }
    companionFiles.push(fileName);
    companionPaths.push(candidatePath);
  }

  return {
    rulesDir: path.join(baseDir, "rules"),
    baseDir,
    companionFiles,
    companionPaths,
  };
}

function expectedRulesConfigFiles(toolId: string, projectScoped: boolean): string[] {
  if (toolId === "claude") {
    return ["setting.json", "settings.json", "setting.local.json", "settings.local.json"];
  }
  if (toolId === "cursor") {
    return projectScoped ? ["cli.json"] : ["cli-config.json"];
  }
  if (toolId === "codex") {
    return ["config.toml"];
  }
  return [];
}

export function rulesRootFromSourcePath(sourcePath: string): string {
  const resolved = path.resolve(sourcePath);
  return path.basename(resolved) === "rules" ? resolved : path.dirname(resolved);
}

export async function detectRulesCompanionsForImport(rulesDirInput: string): Promise<RulesCompanionDetection> {
  const rulesDir = path.resolve(rulesDirInput);
  const baseDir = path.dirname(rulesDir);
  const fileNames = uniqueNames([...IMPORT_RULES_CONFIG_FILES, ...RULES_SIDECAR_FILE_NAMES]);
  const detected = await resolveExistingFiles(baseDir, fileNames);
  return {
    ...detected,
    rulesDir,
  };
}

export async function detectRulesCompanionsForLink(input: {
  rulesDir: string;
  toolId: string;
  projectPath?: string;
}): Promise<RulesCompanionDetection> {
  const rulesDir = path.resolve(input.rulesDir);
  const baseDir = path.dirname(rulesDir);
  const projectScoped = Boolean(input.projectPath && input.projectPath.trim());
  const configFiles = expectedRulesConfigFiles(input.toolId, projectScoped);
  const fileNames = uniqueNames([...configFiles, ...RULES_SIDECAR_FILE_NAMES]);
  const detected = await resolveExistingFiles(baseDir, fileNames);
  return {
    ...detected,
    rulesDir,
  };
}

export async function archiveRulesWithCompanions(input: {
  rulesDir: string;
  companionPaths: string[];
  root?: string;
}): Promise<{ snapshotDir: string; companionFiles: string[] }> {
  const root = input.root ?? getHubRoot();
  const p = hubPaths(root);
  const rulesDir = path.resolve(input.rulesDir);
  const companionPaths = [...new Set(input.companionPaths.map((item) => path.resolve(item)).sort())];
  const digest = crypto
    .createHash("sha1")
    .update([rulesDir, ...companionPaths].join("\n"))
    .digest("hex")
    .slice(0, 12);

  const snapshotDir = path.join(p.rulesStore, "_imports", `${Date.now()}-${digest}`);
  await ensureDir(snapshotDir);
  await copyRecursive(rulesDir, path.join(snapshotDir, "rules"));
  for (const companionPath of companionPaths) {
    await copyRecursive(companionPath, path.join(snapshotDir, path.basename(companionPath)));
  }

  return {
    snapshotDir,
    companionFiles: companionPaths.map((item) => path.basename(item)),
  };
}
