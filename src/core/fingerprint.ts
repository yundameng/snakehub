import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { isDirectory, shouldIgnoreName } from "./fs-utils";
import { FingerprintFile, FingerprintResult } from "./types";

async function fileHash(filePath: string): Promise<{ hash: string; size: number }> {
  const content = await fs.readFile(filePath);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  return { hash, size: content.length };
}

async function walk(dirPath: string, basePath: string, output: FingerprintFile[]): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (shouldIgnoreName(entry.name)) {
      continue;
    }

    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await walk(absPath, basePath, output);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }

    const relPath = path
      .relative(basePath, absPath)
      .split(path.sep)
      .join("/");
    const { hash, size } = await fileHash(absPath);
    output.push({ relativePath: relPath, hash, size });
  }
}

export async function fingerprintPath(inputPath: string): Promise<FingerprintResult> {
  const absPath = path.resolve(inputPath);
  const files: FingerprintFile[] = [];

  if (await isDirectory(absPath)) {
    await walk(absPath, absPath, files);
  } else {
    const name = path.basename(absPath);
    const { hash, size } = await fileHash(absPath);
    files.push({ relativePath: name, hash, size });
  }

  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  const descriptor = files.map((f) => `${f.relativePath}\0${f.hash}\0${f.size}`).join("\n");
  const fingerprint = crypto.createHash("sha256").update(descriptor).digest("hex");

  return { fingerprint, files };
}
