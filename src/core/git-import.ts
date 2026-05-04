import { execFile as execFileCb } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { shouldIgnoreName } from "./fs-utils";
import {
  annotateGitError,
  buildHttpsFallbackRepoUrl,
  buildSshFallbackRepoUrl,
  isGitAuthError,
  resolveGitEnv,
} from "./git-runtime";
import { importResource } from "./importer";
import { ResourceType } from "./types";

const execFile = promisify(execFileCb);
const MAX_SCAN_DEPTH = 8;

export interface RepoImportCandidate {
  id: string;
  type: ResourceType;
  relativePath: string;
  absolutePath: string;
  name: string;
}

export interface InspectRepoResult {
  repoUrl: string;
  type: ResourceType;
  ref?: string;
  candidates: RepoImportCandidate[];
}

export interface ImportFromRepoResult {
  repoUrl: string;
  type: ResourceType;
  ref?: string;
  candidates: RepoImportCandidate[];
  selectedCandidates: RepoImportCandidate[];
  imported: Array<{
    candidate: RepoImportCandidate;
    reused: boolean;
    resourceId: string;
    resourceName: string;
  }>;
}

async function runGit(args: string[], cwd?: string): Promise<void> {
  try {
    await execFile("git", args, {
      cwd,
      maxBuffer: 16 * 1024 * 1024,
      env: resolveGitEnv(),
    });
  } catch (error: unknown) {
    throw annotateGitError(error);
  }
}

async function cloneRepo(repoUrl: string, repoPath: string): Promise<void> {
  try {
    await runGit(["clone", "--depth", "1", repoUrl, repoPath]);
  } catch (error: unknown) {
    if (!isGitAuthError(error)) {
      throw error;
    }

    const fallbacks = [buildSshFallbackRepoUrl(repoUrl), buildHttpsFallbackRepoUrl(repoUrl)]
      .map((item) => item?.trim() || "")
      .filter(Boolean)
      .filter((item, index, list) => item !== repoUrl && list.indexOf(item) === index);

    let lastAuthError: unknown = error;
    for (const fallbackUrl of fallbacks) {
      await fs.rm(repoPath, { recursive: true, force: true }).catch(() => undefined);
      try {
        await runGit(["clone", "--depth", "1", fallbackUrl, repoPath]);
        return;
      } catch (fallbackError: unknown) {
        if (!isGitAuthError(fallbackError)) {
          throw fallbackError;
        }
        lastAuthError = fallbackError;
      }
    }

    throw lastAuthError;
  }
}

function normalizeRelativePath(relPath: string): string {
  if (!relPath || relPath === ".") {
    return ".";
  }
  return relPath.split(path.sep).join("/");
}

function normalizeSelectValue(value: string): string {
  const cleaned = value.trim().replace(/\\/g, "/").replace(/^\.\//, "");
  return cleaned || ".";
}

async function findSkillCandidates(repoRoot: string): Promise<RepoImportCandidate[]> {
  const candidates: RepoImportCandidate[] = [];

  async function walk(currentPath: string, depth: number): Promise<void> {
    if (depth > MAX_SCAN_DEPTH) {
      return;
    }

    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    const hasSkillFile = entries.some((entry) => entry.isFile() && entry.name === "SKILL.md");
    if (hasSkillFile) {
      const relPath = normalizeRelativePath(path.relative(repoRoot, currentPath));
      const name = relPath === "." ? path.basename(repoRoot) : path.basename(currentPath);
      candidates.push({
        id: `skill-${candidates.length + 1}`,
        type: "skills",
        relativePath: relPath,
        absolutePath: currentPath,
        name,
      });
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (shouldIgnoreName(entry.name)) {
        continue;
      }
      const nextPath = path.join(currentPath, entry.name);
      await walk(nextPath, depth + 1);
    }
  }

  await walk(repoRoot, 0);
  candidates.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return candidates.map((candidate, index) => ({
    ...candidate,
    id: `skill-${index + 1}`,
  }));
}

function buildGenericCandidate(repoRoot: string, type: ResourceType, selectPath?: string): RepoImportCandidate {
  const rel = normalizeSelectValue(selectPath ?? ".");
  const absolutePath = rel === "." ? repoRoot : path.resolve(repoRoot, rel);
  const name = rel === "." ? path.basename(repoRoot) : path.basename(absolutePath);
  return {
    id: `${type.slice(0, -1)}-1`,
    type,
    relativePath: rel,
    absolutePath,
    name,
  };
}

function pickCandidates(input: {
  candidates: RepoImportCandidate[];
  select?: string;
  all?: boolean;
  type: ResourceType;
}): RepoImportCandidate[] {
  const { candidates, select, all, type } = input;
  if (candidates.length === 0) {
    throw new Error(`No ${type} candidates found in repository.`);
  }

  if (all) {
    return candidates;
  }

  if (select && select.trim()) {
    const normalizedSelect = normalizeSelectValue(select);
    const byPath = candidates.filter(
      (candidate) => normalizeSelectValue(candidate.relativePath) === normalizedSelect,
    );
    if (byPath.length === 1) {
      return byPath;
    }

    const byName = candidates.filter((candidate) => candidate.name === select.trim());
    if (byName.length === 1) {
      return byName;
    }
    if (byName.length > 1) {
      throw new Error(`Selection '${select}' is ambiguous. Use --select with relative path.`);
    }

    throw new Error(`Selection '${select}' did not match any candidate.`);
  }

  if (candidates.length === 1) {
    return candidates;
  }

  const options = candidates.map((candidate) => `- ${candidate.relativePath}`).join("\n");
  throw new Error(
    `Repository contains multiple ${type} candidates. Use --select <path> or --all.\n${options}`,
  );
}

async function prepareRepoCheckout(input: {
  repoUrl: string;
  ref?: string;
}): Promise<{ tempRoot: string; repoPath: string }> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "snakehub-repo-"));
  const repoPath = path.join(tempRoot, "repo");

  await cloneRepo(input.repoUrl, repoPath);
  if (input.ref && input.ref.trim()) {
    await runGit(["checkout", input.ref.trim()], repoPath);
  }

  return { tempRoot, repoPath };
}

async function inspectRepoCandidates(input: {
  repoPath: string;
  type: ResourceType;
  select?: string;
}): Promise<RepoImportCandidate[]> {
  if (input.type === "skills") {
    return findSkillCandidates(input.repoPath);
  }
  return [buildGenericCandidate(input.repoPath, input.type, input.select)];
}

export async function inspectRepoForImport(input: {
  repoUrl: string;
  type: ResourceType;
  ref?: string;
  select?: string;
}): Promise<InspectRepoResult> {
  const checkout = await prepareRepoCheckout({ repoUrl: input.repoUrl, ref: input.ref });
  try {
    const candidates = await inspectRepoCandidates({
      repoPath: checkout.repoPath,
      type: input.type,
      select: input.select,
    });

    return {
      repoUrl: input.repoUrl,
      type: input.type,
      ref: input.ref,
      candidates: candidates.map((candidate, index) => ({
        ...candidate,
        id: `${candidate.type.slice(0, -1)}-${index + 1}`,
      })),
    };
  } finally {
    await fs.rm(checkout.tempRoot, { recursive: true, force: true });
  }
}

export async function importFromRepo(input: {
  repoUrl: string;
  type: ResourceType;
  ref?: string;
  select?: string;
  all?: boolean;
  name?: string;
  root?: string;
}): Promise<ImportFromRepoResult> {
  const checkout = await prepareRepoCheckout({ repoUrl: input.repoUrl, ref: input.ref });

  try {
    const candidates = await inspectRepoCandidates({
      repoPath: checkout.repoPath,
      type: input.type,
      select: input.select,
    });

    const selectedCandidates = pickCandidates({
      candidates,
      select: input.select,
      all: input.all,
      type: input.type,
    });

    const imported: ImportFromRepoResult["imported"] = [];
    for (const candidate of selectedCandidates) {
      const result = await importResource({
        type: input.type,
        sourcePath: candidate.absolutePath,
        name: input.name || candidate.name,
        sourceRelativePath:
          candidate.relativePath && candidate.relativePath !== "."
            ? candidate.relativePath
            : `${input.type}/${input.name || candidate.name}`,
        root: input.root,
      });

      imported.push({
        candidate,
        reused: result.reused,
        resourceId: result.resource.id,
        resourceName: result.resource.name,
      });
    }

    return {
      repoUrl: input.repoUrl,
      type: input.type,
      ref: input.ref,
      candidates,
      selectedCandidates,
      imported,
    };
  } finally {
    await fs.rm(checkout.tempRoot, { recursive: true, force: true });
  }
}
