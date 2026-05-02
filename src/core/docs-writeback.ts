import fs from "node:fs/promises";
import path from "node:path";
import { hubPaths } from "./config";
import { ensureDir, pathExists, shouldIgnoreName } from "./fs-utils";

export interface DocsTreeNode {
  name: string;
  relativePath: string;
  kind: "dir" | "file";
  changed?: boolean;
  projectOnly?: boolean;
  children?: DocsTreeNode[];
}

export interface DocsWritebackDetection {
  projectPath: string;
  docsStorePath: string;
  projectDocsPath: string;
  hasDocsStore: boolean;
  hasProjectDocs: boolean;
  changedFiles: string[];
  projectOnlyFiles: string[];
  tree: DocsTreeNode[];
}

export interface DocsWritebackApplyResult {
  projectPath: string;
  projectDocsPath: string;
  docsStorePath: string;
  wroteToProjectFiles: string[];
  wroteToStoreFiles: string[];
  detection: DocsWritebackDetection;
}

interface DocsSnapshot {
  files: Map<string, string>;
  dirs: Set<string>;
}

interface TreeBuildNode {
  name: string;
  relativePath: string;
  kind: "dir" | "file";
  changed?: boolean;
  projectOnly?: boolean;
  children?: Map<string, TreeBuildNode>;
}

function normalizeRelativePath(relativePath: string): string {
  return String(relativePath || "").replaceAll("\\", "/").replace(/^\/+/, "");
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
        projectOnly: Boolean(node.projectOnly),
      };
    });
  };

  return toOutput(rootChildren);
}

export async function detectDocsWritebackChanges(input: {
  projectPath: string;
  rootPath: string;
}): Promise<DocsWritebackDetection> {
  const projectPath = path.resolve(input.projectPath);
  const docsStorePath = path.join(hubPaths(input.rootPath).store, "docs");
  const projectDocsPath = path.join(projectPath, "docs");

  const [hasDocsStore, hasProjectDocs, storeSnapshot, projectSnapshot] = await Promise.all([
    fs
      .stat(docsStorePath)
      .then((item) => item.isDirectory())
      .catch(() => false),
    fs
      .stat(projectDocsPath)
      .then((item) => item.isDirectory())
      .catch(() => false),
    collectDocsSnapshot(docsStorePath),
    collectDocsSnapshot(projectDocsPath),
  ]);

  const changedFiles = new Set<string>();
  for (const [relativePath, storeAbsPath] of storeSnapshot.files.entries()) {
    const projectAbsPath = projectSnapshot.files.get(relativePath);
    if (!projectAbsPath) {
      changedFiles.add(relativePath);
      continue;
    }
    const same = await filesAreEqual(storeAbsPath, projectAbsPath);
    if (!same) {
      changedFiles.add(relativePath);
    }
  }

  const projectOnlyFiles = new Set<string>();
  for (const relativePath of projectSnapshot.files.keys()) {
    if (!storeSnapshot.files.has(relativePath)) {
      projectOnlyFiles.add(relativePath);
    }
  }

  const tree = buildDocsTree({
    storeSnapshot,
    projectSnapshot,
    changedFiles,
    projectOnlyFiles,
  });

  return {
    projectPath,
    docsStorePath,
    projectDocsPath,
    hasDocsStore,
    hasProjectDocs,
    changedFiles: [...changedFiles].sort((a, b) => a.localeCompare(b)),
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

  await ensureDir(detection.projectDocsPath);
  await ensureDir(detection.docsStorePath);

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
  for (const relativePath of detection.projectOnlyFiles) {
    const sourcePath = path.join(detection.projectDocsPath, ...relativePath.split("/"));
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      continue;
    }
    const targetPath = path.join(detection.docsStorePath, ...relativePath.split("/"));
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
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
    wroteToProjectFiles,
    wroteToStoreFiles,
    detection: after,
  };
}
