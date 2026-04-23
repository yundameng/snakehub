import { execFile as execFileCb } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import {
  annotateGitError,
  buildSshFallbackRepoUrl,
  isGitAuthError,
  isSameRepoRemote,
  resolveGitEnv,
} from "./git-runtime";
import { archiveHooksWithConfig, resolveHooksConfigSibling } from "./hooks-config";
import { importResource } from "./importer";
import { ResourceType } from "./types";

const execFile = promisify(execFileCb);
const RESOURCE_TYPES: ResourceType[] = ["skills", "commands", "hooks", "agents"];
const TOOLSET_BUCKETS = new Set(["vue_tools", "mini_tools"]);
type RepoToolsetBucket = "vue_tools" | "mini_tools";

export interface RepoCandidate {
  key: string;
  type: ResourceType;
  name: string;
  relativePath: string;
  absolutePath: string;
  toolsetBucket?: RepoToolsetBucket;
}

export interface RepoScanResult {
  repoId: string;
  repoUrl: string;
  repoPath: string;
  multiToolset: boolean;
  ref?: string;
  candidates: RepoCandidate[];
}

function normalizeRelativePath(relPath: string): string {
  if (!relPath || relPath === ".") {
    return ".";
  }
  return relPath.split(path.sep).join("/");
}

function normalizeSelectValue(value: string): string {
  return normalizeRelativePath(value.trim().replace(/^\.\//, ""));
}

function detectToolsetBucketFromRelativePath(relPath: string): RepoToolsetBucket | undefined {
  const segments = normalizeRelativePath(relPath).split("/").filter(Boolean);
  if (segments.includes("vue_tools")) {
    return "vue_tools";
  }
  if (segments.includes("mini_tools")) {
    return "mini_tools";
  }
  return undefined;
}

function decorateCandidateName(name: string, bucket: RepoToolsetBucket | undefined, multiToolset: boolean): string {
  if (!multiToolset || !bucket) {
    return name;
  }
  return `${name} [${bucket}]`;
}

async function runGit(args: string[], cwd?: string): Promise<string> {
  try {
    const result = await execFile("git", args, {
      cwd,
      maxBuffer: 16 * 1024 * 1024,
      env: resolveGitEnv(),
    });
    return result.stdout?.toString().trim() ?? "";
  } catch (error: unknown) {
    throw annotateGitError(error);
  }
}

async function cloneRepo(repoUrl: string, repoPath: string): Promise<string> {
  try {
    await runGit(["clone", "--depth", "1", repoUrl, repoPath]);
    return repoUrl;
  } catch (error: unknown) {
    const sshFallback = buildSshFallbackRepoUrl(repoUrl);
    if (!sshFallback || !isGitAuthError(error)) {
      throw error;
    }

    await runGit(["clone", "--depth", "1", sshFallback, repoPath]);
    return sshFallback;
  }
}

async function ensureEmptyDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
  const entries = await fs.readdir(dirPath);
  if (entries.length > 0) {
    throw new Error(`Target path is not empty: ${dirPath}`);
  }
}

function buildRepoId(repoUrl: string): string {
  const cleaned = repoUrl
    .trim()
    .replace(/\.git$/i, "")
    .replace(/^[a-zA-Z]+:\/\//, "")
    .replace(/^git@/, "")
    .replace(/[\\/:@]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .toLowerCase();

  const hash = crypto.createHash("sha1").update(repoUrl).digest("hex").slice(0, 8);
  return `${cleaned || "repo"}-${hash}`;
}

async function findSkillCandidates(repoPath: string, multiToolset = false): Promise<RepoCandidate[]> {
  const candidates: RepoCandidate[] = [];

  async function walk(currentPath: string, depth: number): Promise<void> {
    if (depth > 8) {
      return;
    }

    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    const hasSkillFile = entries.some((entry) => entry.isFile() && entry.name === "SKILL.md");

    if (hasSkillFile) {
      const rel = normalizeRelativePath(path.relative(repoPath, currentPath));
      const bucket = detectToolsetBucketFromRelativePath(rel);
      candidates.push({
        key: `skills:${rel}`,
        type: "skills",
        name: decorateCandidateName(path.basename(currentPath), bucket, multiToolset),
        relativePath: rel,
        absolutePath: currentPath,
        toolsetBucket: bucket,
      });
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      await walk(path.join(currentPath, entry.name), depth + 1);
    }
  }

  await walk(repoPath, 0);
  candidates.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return candidates;
}

async function findTypedCandidates(
  repoPath: string,
  type: Exclude<ResourceType, "skills">,
  multiToolset = false,
): Promise<RepoCandidate[]> {
  const base = path.join(repoPath, type);
  try {
    const stat = await fs.stat(base);
    if (!stat.isDirectory()) {
      return [];
    }
  } catch {
    return [];
  }

  const entries = await fs.readdir(base, { withFileTypes: true });
  const candidates: RepoCandidate[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const abs = path.join(base, entry.name);
    if (multiToolset && entry.isDirectory() && TOOLSET_BUCKETS.has(entry.name)) {
      const bucket = entry.name as RepoToolsetBucket;
      const nested = await fs.readdir(abs, { withFileTypes: true });
      for (const child of nested) {
        if (child.name.startsWith(".")) {
          continue;
        }
        const childAbs = path.join(abs, child.name);
        const childRel = normalizeRelativePath(path.relative(repoPath, childAbs));
        if (child.isDirectory()) {
          candidates.push({
            key: `${type}:${childRel}`,
            type,
            name: decorateCandidateName(child.name, bucket, multiToolset),
            relativePath: childRel,
            absolutePath: childAbs,
            toolsetBucket: bucket,
          });
          continue;
        }
        if (child.isFile()) {
          const childName = path.parse(child.name).name || child.name;
          candidates.push({
            key: `${type}:${childRel}`,
            type,
            name: decorateCandidateName(childName, bucket, multiToolset),
            relativePath: childRel,
            absolutePath: childAbs,
            toolsetBucket: bucket,
          });
        }
      }
      continue;
    }

    const rel = normalizeRelativePath(path.relative(repoPath, abs));
    const bucket = detectToolsetBucketFromRelativePath(rel);
    if (entry.isDirectory()) {
      candidates.push({
        key: `${type}:${rel}`,
        type,
        name: decorateCandidateName(entry.name, bucket, multiToolset),
        relativePath: rel,
        absolutePath: abs,
        toolsetBucket: bucket,
      });
      continue;
    }

    if (entry.isFile()) {
      const name = path.parse(entry.name).name || entry.name;
      candidates.push({
        key: `${type}:${rel}`,
        type,
        name: decorateCandidateName(name, bucket, multiToolset),
        relativePath: rel,
        absolutePath: abs,
        toolsetBucket: bucket,
      });
    }
  }

  candidates.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return candidates;
}

export async function ensureRepoCheckout(input: {
  repoUrl: string;
  ref?: string;
  targetPath?: string;
  root?: string;
}): Promise<{ repoId: string; repoPath: string }> {
  const root = input.root ?? getHubRoot();
  await ensureHubLayout(root);

  const requestedRepoUrl = input.repoUrl.trim();
  if (!requestedRepoUrl) {
    throw new Error("repoUrl is required.");
  }

  const repoId = buildRepoId(requestedRepoUrl);
  const defaultPath = path.join(hubPaths(root).repos, repoId);
  const repoPath = input.targetPath?.trim() ? path.resolve(input.targetPath) : defaultPath;
  const gitDir = path.join(repoPath, ".git");

  let hasRepo = false;
  try {
    const stat = await fs.stat(gitDir);
    hasRepo = stat.isDirectory();
  } catch {
    hasRepo = false;
  }

  if (!hasRepo) {
    const exists = await fs
      .stat(repoPath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      await ensureEmptyDirectory(repoPath);
    }

    await cloneRepo(requestedRepoUrl, repoPath);
  } else {
    const origin = await runGit(["remote", "get-url", "origin"], repoPath).catch(() => "");
    if (origin && !isSameRepoRemote(origin, requestedRepoUrl) && normalizeSelectValue(origin) !== normalizeSelectValue(requestedRepoUrl)) {
      throw new Error(`Target path already points to another remote: ${origin}`);
    }
    await runGit(["fetch", "--all", "--prune"], repoPath);
  }

  if (input.ref && input.ref.trim()) {
    const ref = input.ref.trim();
    await runGit(["checkout", ref], repoPath);
    await runGit(["pull", "--ff-only", "origin", ref], repoPath).catch(() => undefined);
  } else {
    await runGit(["pull", "--ff-only"], repoPath).catch(() => undefined);
  }

  return { repoId, repoPath };
}

export async function scanRepoCandidates(input: {
  repoUrl?: string;
  repoPath?: string;
  ref?: string;
  targetPath?: string;
  multiToolset?: boolean;
  root?: string;
}): Promise<RepoScanResult> {
  let repoPath = input.repoPath ? path.resolve(input.repoPath) : "";
  let repoId = "local-scan";
  let repoUrl = input.repoUrl?.trim() || "";

  if (repoUrl) {
    const prepared = await ensureRepoCheckout({
      repoUrl,
      ref: input.ref,
      targetPath: input.targetPath,
      root: input.root,
    });
    repoPath = prepared.repoPath;
    repoId = prepared.repoId;
  }

  if (!repoPath) {
    throw new Error("repoPath or repoUrl is required.");
  }

  const multiToolset = Boolean(input.multiToolset);
  const skills = await findSkillCandidates(repoPath, multiToolset);
  const commands = await findTypedCandidates(repoPath, "commands", multiToolset);
  const hooks = await findTypedCandidates(repoPath, "hooks", multiToolset);
  const agents = await findTypedCandidates(repoPath, "agents", multiToolset);

  const candidates = [...skills, ...commands, ...hooks, ...agents];
  const unique = new Map<string, RepoCandidate>();
  for (const candidate of candidates) {
    unique.set(candidate.key, candidate);
  }

  if (!repoUrl) {
    repoUrl = await runGit(["remote", "get-url", "origin"], repoPath).catch(() => "");
    repoId = repoUrl ? buildRepoId(repoUrl) : path.basename(repoPath);
  }

  return {
    repoId,
    repoUrl,
    repoPath,
    multiToolset,
    ref: input.ref,
    candidates: [...unique.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
}

export async function importRepoCandidatesToHub(input: {
  repoPath: string;
  selectedKeys: string[];
  multiToolset?: boolean;
  root?: string;
}): Promise<{
  imported: Array<{ key: string; type: ResourceType; name: string; reused: boolean; resourceId: string }>;
  hooksSnapshot?: {
    snapshotDir: string;
    configFileName: string;
  };
}> {
  const repoPath = path.resolve(input.repoPath);
  const scan = await scanRepoCandidates({ repoPath, multiToolset: input.multiToolset, root: input.root });
  const byKey = new Map(scan.candidates.map((candidate) => [candidate.key, candidate]));

  const selected = [...new Set(input.selectedKeys.map((key) => key.trim()).filter(Boolean))];
  if (selected.length === 0) {
    throw new Error("selectedKeys is empty.");
  }

  const allHookCandidates = scan.candidates.filter((candidate) => candidate.type === "hooks");
  const allHookKeys = new Set(allHookCandidates.map((candidate) => candidate.key));
  const selectedHookKeys = selected.filter((key) => allHookKeys.has(key));
  const hasHookSelection = selectedHookKeys.length > 0;
  if (hasHookSelection && selectedHookKeys.length !== allHookCandidates.length) {
    throw new Error("Hooks must be imported as a full set. Please select all hooks candidates.");
  }

  let hooksSnapshot:
    | {
        snapshotDir: string;
        configFileName: string;
      }
    | undefined;
  if (hasHookSelection) {
    const hooksDir = path.join(repoPath, "hooks");
    const resolved = await resolveHooksConfigSibling(hooksDir);
    hooksSnapshot = await archiveHooksWithConfig({
      hooksDir: resolved.hooksDir,
      configPath: resolved.configPath,
      root: input.root,
    });
  }

  const imported: Array<{ key: string; type: ResourceType; name: string; reused: boolean; resourceId: string }> = [];
  for (const key of selected) {
    const candidate = byKey.get(key);
    if (!candidate) {
      continue;
    }

    const result = await importResource({
      type: candidate.type,
      sourcePath: candidate.absolutePath,
      name: candidate.name,
      root: input.root,
    });

    imported.push({
      key: candidate.key,
      type: candidate.type,
      name: candidate.name,
      reused: result.reused,
      resourceId: result.resource.id,
    });
  }

  return { imported, hooksSnapshot };
}

export function resourceTypesOrder(): ResourceType[] {
  return [...RESOURCE_TYPES];
}
