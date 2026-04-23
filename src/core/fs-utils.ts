import fs from "node:fs/promises";
import path from "node:path";

const IGNORED_NAMES = new Set([
  ".git",
  "node_modules",
  "dist",
  ".DS_Store",
  ".idea",
  ".vscode",
]);

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function isDirectory(targetPath: string): Promise<boolean> {
  const stat = await fs.stat(targetPath);
  return stat.isDirectory();
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  const tmpFile = `${filePath}.tmp`;
  await fs.writeFile(tmpFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(tmpFile, filePath);
}

export async function copyRecursive(srcPath: string, destPath: string): Promise<void> {
  const stat = await fs.stat(srcPath);
  if (stat.isDirectory()) {
    await ensureDir(destPath);
    const entries = await fs.readdir(srcPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name)) {
        continue;
      }
      const from = path.join(srcPath, entry.name);
      const to = path.join(destPath, entry.name);
      if (entry.isDirectory()) {
        await copyRecursive(from, to);
      } else if (entry.isFile()) {
        await fs.copyFile(from, to);
      }
    }
    return;
  }
  await ensureDir(path.dirname(destPath));
  await fs.copyFile(srcPath, destPath);
}

export async function removePath(targetPath: string): Promise<void> {
  if (!(await pathExists(targetPath))) {
    return;
  }
  await fs.rm(targetPath, { recursive: true, force: true });
}

export async function movePath(srcPath: string, destPath: string): Promise<void> {
  await ensureDir(path.dirname(destPath));
  await fs.rename(srcPath, destPath);
}

export async function createDirLink(targetPath: string, linkPath: string): Promise<void> {
  await ensureDir(path.dirname(linkPath));
  const normalizedTarget = path.resolve(targetPath);
  const type = process.platform === "win32" ? "junction" : "dir";
  await fs.symlink(normalizedTarget, linkPath, type);
}

export function shouldIgnoreName(name: string): boolean {
  return IGNORED_NAMES.has(name);
}
