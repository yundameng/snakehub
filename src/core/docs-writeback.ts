import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { hubPaths } from "./config";
import { loadDocsWritebackMap, normalizeRelativeRepoPath } from "./docs-writeback-map";
import { ensureDir, pathExists, shouldIgnoreName } from "./fs-utils";
import { loadState } from "./state";

export interface DocsTreeNode {
  name: string;
  relativePath: string;
  kind: "dir" | "file";
  changed?: boolean;
  projectChanged?: boolean;
  projectOnly?: boolean;
  children?: DocsTreeNode[];
}

export interface DocsWritebackDetection {
  projectPath: string;
  docsStorePath: string;
  runtimeStorePath: string;
  projectDocsPath: string;
  hasDocsStore: boolean;
  hasProjectDocs: boolean;
  changedFiles: string[];
  projectChangedFiles: string[];
  projectOnlyFiles: string[];
  tree: DocsTreeNode[];
}

export interface DocsWritebackApplyResult {
  projectPath: string;
  projectDocsPath: string;
  docsStorePath: string;
  runtimeStorePath: string;
  wroteToProjectFiles: string[];
  wroteToStoreFiles: string[];
  detection: DocsWritebackDetection;
}

export interface DocsRemoteSyncPrepareResult {
  projectPath: string;
  projectDocsPath: string;
  docsStorePath: string;
  runtimeStorePath: string;
  hasSyncableFiles: boolean;
  storeChangedFiles: string[];
  unsyncedFiles: string[];
  syncedToProjectFiles: string[];
  detection: DocsWritebackDetection;
}

interface DocsSnapshot {
  files: Map<string, string>;
  dirs: Set<string>;
}

interface CanonicalStoreSnapshot {
  files: Map<string, string[]>;
  dirs: Set<string>;
}

const MONITORED_ROOT_DIRS = ["docs", "skills", "commands", "hooks", "rules"] as const;

interface TreeBuildNode {
  name: string;
  relativePath: string;
  kind: "dir" | "file";
  changed?: boolean;
  projectChanged?: boolean;
  projectOnly?: boolean;
  children?: Map<string, TreeBuildNode>;
}

function normalizeRelativePath(relativePath: string): string {
  return String(relativePath || "").replaceAll("\\", "/").replace(/^\/+/, "");
}

function hasPathPrefix(target: string, prefix: string): boolean {
  const normalizedTarget = normalizeRelativePath(target);
  const normalizedPrefix = normalizeRelativePath(prefix);
  if (!normalizedPrefix) {
    return false;
  }
  return normalizedTarget === normalizedPrefix || normalizedTarget.startsWith(`${normalizedPrefix}/`);
}

function replacePathPrefix(target: string, fromPrefix: string, toPrefix: string): string {
  const normalizedTarget = normalizeRelativePath(target);
  const from = normalizeRelativePath(fromPrefix);
  const to = normalizeRelativePath(toPrefix);
  if (!hasPathPrefix(normalizedTarget, from)) {
    return normalizedTarget;
  }
  if (normalizedTarget === from) {
    return to;
  }
  const suffix = normalizedTarget.slice(from.length + 1);
  return normalizeRelativePath(`${to}/${suffix}`);
}

function stripGeneratedResourcePrefix(inputName: string): string {
  const text = String(inputName || "");
  return text.replace(/^[a-z]+_[0-9a-f]+-/i, "");
}

function relativeParentPath(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized || !normalized.includes("/")) {
    return "";
  }
  return normalized.slice(0, normalized.lastIndexOf("/"));
}

function splitRelativePath(relativePath: string): string[] {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized) {
    return [];
  }
  return normalized.split("/").filter(Boolean);
}

function sortTreeNodes(a: TreeBuildNode, b: TreeBuildNode): number {
  if (a.kind === "dir" && b.kind === "file") {
    return -1;
  }
  if (a.kind === "file" && b.kind === "dir") {
    return 1;
  }
  return a.name.localeCompare(b.name);
}

async function filesAreEqual(sourcePath: string, targetPath: string): Promise<boolean> {
  const targetExists = await pathExists(targetPath);
  if (!targetExists) {
    return false;
  }

  const [sourceStat, targetStat] = await Promise.all([fs.stat(sourcePath), fs.stat(targetPath)]);
  if (!sourceStat.isFile() || !targetStat.isFile()) {
    return false;
  }

  if (sourceStat.size !== targetStat.size) {
    return false;
  }

  const [sourceContent, targetContent] = await Promise.all([fs.readFile(sourcePath), fs.readFile(targetPath)]);
  return sourceContent.equals(targetContent);
}

async function fileContentHash(
  filePath: string,
  cache: Map<string, string>,
): Promise<string> {
  const normalized = path.resolve(filePath);
  const cached = cache.get(normalized);
  if (cached) {
    return cached;
  }
  const content = await fs.readFile(normalized);
  const digest = crypto.createHash("sha1").update(content).digest("hex");
  cache.set(normalized, digest);
  return digest;
}

async function collectDocsSnapshot(rootDir: string): Promise<DocsSnapshot> {
  const files = new Map<string, string>();
  const dirs = new Set<string>();

  const rootExists = await fs
    .stat(rootDir)
    .then((item) => item.isDirectory())
    .catch(() => false);
  if (!rootExists) {
    return { files, dirs };
  }

  const walk = async (currentDir: string, relativePrefix: string): Promise<void> => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    const filtered = entries
      .filter((entry) => !entry.name.startsWith(".") && !shouldIgnoreName(entry.name))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) {
          return -1;
        }
        if (!a.isDirectory() && b.isDirectory()) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      });

    for (const entry of filtered) {
      const nextRelative = normalizeRelativePath(relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name);
      const absPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        dirs.add(nextRelative);
        await walk(absPath, nextRelative);
        continue;
      }
      if (entry.isFile()) {
        files.set(nextRelative, absPath);
      }
    }
  };

  await walk(rootDir, "");
  return { files, dirs };
}

async function collectMonitoredSnapshot(baseRoot: string): Promise<DocsSnapshot> {
  const merged: DocsSnapshot = {
    files: new Map<string, string>(),
    dirs: new Set<string>(),
  };

  const includeFile = (rootDir: string, relativeFile: string): boolean => {
    if (rootDir !== "rules") {
      return true;
    }
    return path.extname(relativeFile).toLowerCase() === ".md";
  };

  const collectDirAncestors = (relativeFilePath: string): string[] => {
    const normalized = normalizeRelativePath(relativeFilePath);
    if (!normalized.includes("/")) {
      return [];
    }
    const parts = normalized.split("/");
    const dirs: string[] = [];
    let current = "";
    for (let i = 0; i < parts.length - 1; i += 1) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      dirs.push(current);
    }
    return dirs;
  };

  for (const dirName of MONITORED_ROOT_DIRS) {
    const abs = path.join(baseRoot, dirName);
    const dirExists = await fs
      .stat(abs)
      .then((item) => item.isDirectory())
      .catch(() => false);
    if (!dirExists) {
      continue;
    }
    const snapshot = await collectDocsSnapshot(abs);
    let hasIncludedFile = false;
    for (const [relFile, absFile] of snapshot.files.entries()) {
      if (!includeFile(dirName, relFile)) {
        continue;
      }
      hasIncludedFile = true;
      merged.files.set(normalizeRelativePath(`${dirName}/${relFile}`), absFile);
      for (const relDir of collectDirAncestors(relFile)) {
        merged.dirs.add(normalizeRelativePath(`${dirName}/${relDir}`));
      }
    }
    if (hasIncludedFile) {
      merged.dirs.add(dirName);
    }
  }

  return merged;
}

function ensureDirectoryNode(rootChildren: Map<string, TreeBuildNode>, relativePath: string): Map<string, TreeBuildNode> {
  const parts = splitRelativePath(relativePath);
  let currentChildren = rootChildren;
  let currentRelative = "";

  for (const part of parts) {
    currentRelative = normalizeRelativePath(currentRelative ? `${currentRelative}/${part}` : part);
    const existing = currentChildren.get(part);
    if (existing && existing.kind === "dir") {
      if (!existing.children) {
        existing.children = new Map<string, TreeBuildNode>();
      }
      currentChildren = existing.children;
      continue;
    }

    const created: TreeBuildNode = {
      name: part,
      relativePath: currentRelative,
      kind: "dir",
      children: new Map<string, TreeBuildNode>(),
    };
    currentChildren.set(part, created);
    currentChildren = created.children as Map<string, TreeBuildNode>;
  }

  return currentChildren;
}

function buildDocsTree(input: {
  storeSnapshot: DocsSnapshot;
  projectSnapshot: DocsSnapshot;
  changedFiles: Set<string>;
  projectChangedFiles: Set<string>;
  projectOnlyFiles: Set<string>;
}): DocsTreeNode[] {
  const rootChildren = new Map<string, TreeBuildNode>();

  const allDirPaths = new Set<string>([...input.storeSnapshot.dirs, ...input.projectSnapshot.dirs]);
  for (const dirPath of [...allDirPaths].sort((a, b) => a.localeCompare(b))) {
    ensureDirectoryNode(rootChildren, dirPath);
  }

  const storeFiles = [...input.storeSnapshot.files.keys()].sort((a, b) => a.localeCompare(b));
  for (const filePath of storeFiles) {
    const parentPath = relativeParentPath(filePath);
    const fileName = path.basename(filePath);
    const targetChildren = ensureDirectoryNode(rootChildren, parentPath);
    targetChildren.set(fileName, {
      name: fileName,
      relativePath: filePath,
      kind: "file",
      changed: input.changedFiles.has(filePath),
      projectChanged: input.projectChangedFiles.has(filePath),
    });
  }

  const projectOnlyFiles = [...input.projectOnlyFiles].sort((a, b) => a.localeCompare(b));
  for (const filePath of projectOnlyFiles) {
    const parentPath = relativeParentPath(filePath);
    const fileName = path.basename(filePath);
    const targetChildren = ensureDirectoryNode(rootChildren, parentPath);
    targetChildren.set(fileName, {
      name: fileName,
      relativePath: filePath,
      kind: "file",
      projectOnly: true,
    });
  }

  const toOutput = (nodes: Map<string, TreeBuildNode>): DocsTreeNode[] => {
    const sorted = [...nodes.values()].sort(sortTreeNodes);
    return sorted.map((node) => {
      if (node.kind === "dir") {
        return {
          name: node.name,
          relativePath: node.relativePath,
          kind: "dir",
          children: toOutput(node.children || new Map<string, TreeBuildNode>()),
        };
      }
      return {
        name: node.name,
        relativePath: node.relativePath,
        kind: "file",
        changed: Boolean(node.changed),
        projectChanged: Boolean(node.projectChanged),
        projectOnly: Boolean(node.projectOnly),
      };
    });
  };

  return toOutput(rootChildren);
}

function applyCanonicalMapping(input: {
  snapshot: DocsSnapshot;
  canonicalRules: Array<{ canonicalBase: string; aliasBase: string }>;
}): CanonicalStoreSnapshot {
  const files = new Map<string, string[]>();
  const dirs = new Set<string>();

  for (const [relPath, absPath] of input.snapshot.files.entries()) {
    let canonicalRel = relPath;
    for (const rule of input.canonicalRules) {
      if (hasPathPrefix(canonicalRel, rule.aliasBase)) {
        canonicalRel = replacePathPrefix(canonicalRel, rule.aliasBase, rule.canonicalBase);
        break;
      }
    }
    const list = files.get(canonicalRel) || [];
    list.push(absPath);
    files.set(canonicalRel, list);
  }

  for (const dirPath of input.snapshot.dirs) {
    let canonicalDir = dirPath;
    for (const rule of input.canonicalRules) {
      if (hasPathPrefix(canonicalDir, rule.aliasBase)) {
        canonicalDir = replacePathPrefix(canonicalDir, rule.aliasBase, rule.canonicalBase);
        break;
      }
    }
    dirs.add(canonicalDir);
  }

  return { files, dirs };
}

async function latestMtime(filePaths: string[]): Promise<number> {
  let latest = 0;
  for (const filePath of filePaths) {
    const mtime = await fs
      .stat(filePath)
      .then((item) => Number(item.mtimeMs || 0))
      .catch(() => 0);
    if (mtime > latest) {
      latest = mtime;
    }
  }
  return latest;
}

export async function detectDocsWritebackChanges(input: {
  projectPath: string;
  rootPath: string;
}): Promise<DocsWritebackDetection> {
  const projectPath = path.resolve(input.projectPath);
  const paths = hubPaths(input.rootPath);
  const docsStorePath = path.join(paths.storeSource);
  const runtimeStorePath = path.join(paths.storeRuntime);
  const projectDocsPath = projectPath;

  const [hasDocsStore, hasProjectDocs, storeSnapshot, projectSnapshot] = await Promise.all([
    fs
      .stat(path.join(docsStorePath, "docs"))
      .then((item) => item.isDirectory())
      .catch(() => false),
    fs
      .stat(path.join(projectDocsPath, "docs"))
      .then((item) => item.isDirectory())
      .catch(() => false),
    collectMonitoredSnapshot(docsStorePath),
    collectMonitoredSnapshot(projectDocsPath),
  ]);

  const mappingConfig = await loadDocsWritebackMap(input.rootPath);
  const state = await loadState(input.rootPath);
  const inferredRules = state.resources
    .filter((resource) => MONITORED_ROOT_DIRS.includes(resource.type as (typeof MONITORED_ROOT_DIRS)[number]))
    .map((resource) => {
      const aliasBase = normalizeRelativeRepoPath(path.relative(runtimeStorePath, path.resolve(resource.storePath)));
      if (!aliasBase) {
        return null;
      }

      const sourceAbs = path.resolve(String(resource.sourcePath || ""));
      const sourceRel = normalizeRelativeRepoPath(path.relative(projectDocsPath, sourceAbs));
      const sourceInProject = sourceRel && !sourceRel.startsWith("..");
      let canonicalBase = sourceInProject ? sourceRel : "";
      if (!canonicalBase) {
        const typePrefix = String(resource.type || "").trim();
        const aliasName = stripGeneratedResourcePrefix(path.basename(aliasBase));
        if (typePrefix && aliasName) {
          canonicalBase = normalizeRelativeRepoPath(`${typePrefix}/${aliasName}`);
        }
      }

      if (!canonicalBase || canonicalBase === aliasBase) {
        return null;
      }
      return { canonicalBase, aliasBase };
    })
    .filter((item): item is { canonicalBase: string; aliasBase: string } => Boolean(item));

  const canonicalRules = [
    ...mappingConfig.groups
    .flatMap((group) =>
      (group.aliases || []).map((aliasBase) => ({
        canonicalBase: normalizeRelativeRepoPath(group.canonicalBase),
        aliasBase: normalizeRelativeRepoPath(aliasBase),
      })),
    )
    .filter((item) => item.canonicalBase && item.aliasBase && item.canonicalBase !== item.aliasBase),
    ...inferredRules,
  ]
    .filter((item) => item.canonicalBase && item.aliasBase && item.canonicalBase !== item.aliasBase)
    .sort((a, b) => b.aliasBase.length - a.aliasBase.length);

  const canonicalStore = applyCanonicalMapping({
    snapshot: storeSnapshot,
    canonicalRules,
  });
  const canonicalProject = applyCanonicalMapping({
    snapshot: projectSnapshot,
    canonicalRules,
  });

  const changedFiles = new Set<string>();
  const projectChangedFiles = new Set<string>();
  for (const [relativePath, storeAbsList] of canonicalStore.files.entries()) {
    const projectAbsPath = (canonicalProject.files.get(relativePath) || [])[0];
    const storeAbsPath = storeAbsList[0];
    if (!projectAbsPath) {
      changedFiles.add(relativePath);
      continue;
    }
    const same = await filesAreEqual(storeAbsPath, projectAbsPath);
    if (!same) {
      const [storeMtime, projectMtime] = await Promise.all([
        latestMtime(storeAbsList),
        fs
          .stat(projectAbsPath)
          .then((item) => Number(item.mtimeMs || 0))
          .catch(() => 0),
      ]);
      if (projectMtime > storeMtime) {
        projectChangedFiles.add(relativePath);
      } else {
        changedFiles.add(relativePath);
      }
    }
  }

  const projectOnlyFiles = new Set<string>();
  const hashCache = new Map<string, string>();
  const storeHashes = new Set<string>();
  for (const absPaths of canonicalStore.files.values()) {
    for (const absPath of absPaths) {
      const hash = await fileContentHash(absPath, hashCache).catch(() => "");
      if (hash) {
        storeHashes.add(hash);
      }
    }
  }

  for (const relativePath of canonicalProject.files.keys()) {
    if (!canonicalStore.files.has(relativePath)) {
      const projectAbsPath = (canonicalProject.files.get(relativePath) || [])[0] || "";
      const projectHash = projectAbsPath
        ? await fileContentHash(projectAbsPath, hashCache).catch(() => "")
        : "";
      // Same-content file already exists in store under another path; do not flag as "project-only".
      if (projectHash && storeHashes.has(projectHash)) {
        continue;
      }
      projectOnlyFiles.add(relativePath);
    }
  }

  const tree = buildDocsTree({
    storeSnapshot: {
      files: new Map([...canonicalStore.files.entries()].map(([k, v]) => [k, v[0]])),
      dirs: canonicalStore.dirs,
    },
    projectSnapshot: {
      files: new Map([...canonicalProject.files.entries()].map(([k, v]) => [k, v[0]])),
      dirs: canonicalProject.dirs,
    },
    changedFiles,
    projectChangedFiles,
    projectOnlyFiles,
  });

  return {
    projectPath,
    docsStorePath,
    runtimeStorePath,
    projectDocsPath,
    hasDocsStore,
    hasProjectDocs,
    changedFiles: [...changedFiles].sort((a, b) => a.localeCompare(b)),
    projectChangedFiles: [...projectChangedFiles].sort((a, b) => a.localeCompare(b)),
    projectOnlyFiles: [...projectOnlyFiles].sort((a, b) => a.localeCompare(b)),
    tree,
  };
}

export async function applyDocsWritebackToProject(input: {
  projectPath: string;
  rootPath: string;
}): Promise<DocsWritebackApplyResult> {
  const detection = await detectDocsWritebackChanges({
    projectPath: input.projectPath,
    rootPath: input.rootPath,
  });
  const mapConfig = await loadDocsWritebackMap(input.rootPath);

  await ensureDir(detection.projectDocsPath);
  await ensureDir(detection.docsStorePath);
  await ensureDir(detection.runtimeStorePath);

  const wroteToProjectFiles: string[] = [];
  for (const relativePath of detection.changedFiles) {
    const sourcePath = path.join(detection.docsStorePath, ...relativePath.split("/"));
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      continue;
    }
    const targetPath = path.join(detection.projectDocsPath, ...relativePath.split("/"));
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
    wroteToProjectFiles.push(relativePath);
  }

  const wroteToStoreFiles: string[] = [];
  const resolveStoreTargets = (relativePath: string): string[] => {
    const normalized = normalizeRelativePath(relativePath);
    const targets = new Set<string>();
    targets.add(path.join(detection.docsStorePath, ...normalized.split("/")));
    for (const group of mapConfig.groups || []) {
      const canonicalBase = normalizeRelativeRepoPath(group.canonicalBase || "");
      if (!canonicalBase || !hasPathPrefix(normalized, canonicalBase)) {
        continue;
      }
      for (const aliasBaseRaw of group.aliases || []) {
        const aliasBase = normalizeRelativeRepoPath(aliasBaseRaw);
        if (!aliasBase) {
          continue;
        }
        const aliasRel = replacePathPrefix(normalized, canonicalBase, aliasBase);
        targets.add(path.join(detection.runtimeStorePath, ...aliasRel.split("/")));
      }
    }
    return [...targets];
  };

  for (const relativePath of detection.projectChangedFiles || []) {
    const sourcePath = path.join(detection.projectDocsPath, ...relativePath.split("/"));
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      continue;
    }
    const targetPaths = resolveStoreTargets(relativePath);
    for (const targetPath of targetPaths) {
      await ensureDir(path.dirname(targetPath));
      await fs.copyFile(sourcePath, targetPath);
    }
    wroteToStoreFiles.push(relativePath);
  }

  for (const relativePath of detection.projectOnlyFiles) {
    const sourcePath = path.join(detection.projectDocsPath, ...relativePath.split("/"));
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      continue;
    }
    const targetPaths = resolveStoreTargets(relativePath);
    for (const targetPath of targetPaths) {
      await ensureDir(path.dirname(targetPath));
      await fs.copyFile(sourcePath, targetPath);
    }
    wroteToStoreFiles.push(relativePath);
  }

  const after = await detectDocsWritebackChanges({
    projectPath: input.projectPath,
    rootPath: input.rootPath,
  });

  return {
    projectPath: detection.projectPath,
    projectDocsPath: detection.projectDocsPath,
    docsStorePath: detection.docsStorePath,
    runtimeStorePath: detection.runtimeStorePath,
    wroteToProjectFiles,
    wroteToStoreFiles,
    detection: after,
  };
}

export async function prepareDocsWritebackRemoteSync(input: {
  projectPath: string;
  rootPath: string;
}): Promise<DocsRemoteSyncPrepareResult> {
  const detection = await detectDocsWritebackChanges({
    projectPath: input.projectPath,
    rootPath: input.rootPath,
  });

  const storeChangedFiles = [...(detection.changedFiles || [])];
  if (storeChangedFiles.length === 0) {
    return {
      projectPath: detection.projectPath,
      projectDocsPath: detection.projectDocsPath,
      docsStorePath: detection.docsStorePath,
      runtimeStorePath: detection.runtimeStorePath,
      hasSyncableFiles: false,
      storeChangedFiles: [],
      unsyncedFiles: [],
      syncedToProjectFiles: [],
      detection,
    };
  }

  const unsyncedFiles: string[] = [];
  for (const relativePath of storeChangedFiles) {
    const sourcePath = path.join(detection.docsStorePath, ...relativePath.split("/"));
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      continue;
    }
    const targetPath = path.join(detection.projectDocsPath, ...relativePath.split("/"));
    const same = await filesAreEqual(sourcePath, targetPath);
    if (!same) {
      unsyncedFiles.push(relativePath);
    }
  }

  const syncedToProjectFiles: string[] = [];
  for (const relativePath of unsyncedFiles) {
    const sourcePath = path.join(detection.docsStorePath, ...relativePath.split("/"));
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      continue;
    }
    const targetPath = path.join(detection.projectDocsPath, ...relativePath.split("/"));
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
    syncedToProjectFiles.push(relativePath);
  }

  const after = await detectDocsWritebackChanges({
    projectPath: input.projectPath,
    rootPath: input.rootPath,
  });

  return {
    projectPath: detection.projectPath,
    projectDocsPath: detection.projectDocsPath,
    docsStorePath: detection.docsStorePath,
    runtimeStorePath: detection.runtimeStorePath,
    hasSyncableFiles: true,
    storeChangedFiles,
    unsyncedFiles,
    syncedToProjectFiles,
    detection: after,
  };
}
