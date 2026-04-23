import crypto from "node:crypto";
import path from "node:path";
import { getHubRoot, hubPaths } from "./config";
import { copyRecursive, ensureDir, pathExists } from "./fs-utils";

export interface HooksConfigResolution {
  hooksDir: string;
  configPath: string;
  configFileName: "settings.json" | "hooks.json";
}

function preferredConfigOrder(hooksDir: string): Array<"settings.json" | "hooks.json"> {
  const parentName = path.basename(path.dirname(hooksDir));
  if (parentName === ".claude") {
    return ["settings.json", "hooks.json"];
  }
  return ["hooks.json", "settings.json"];
}

export async function resolveHooksConfigSibling(hooksDirInput: string): Promise<HooksConfigResolution> {
  const hooksDir = path.resolve(hooksDirInput);
  const parentDir = path.dirname(hooksDir);
  const fileOrder = preferredConfigOrder(hooksDir);

  for (const configFileName of fileOrder) {
    const configPath = path.join(parentDir, configFileName);
    if (await pathExists(configPath)) {
      return {
        hooksDir,
        configPath,
        configFileName,
      };
    }
  }

  throw new Error(
    `Hooks import requires sibling config file near '${hooksDir}'. Please add 'hooks.json' (Cursor/Codex) or 'settings.json' (Claude).`,
  );
}

export async function archiveHooksWithConfig(input: {
  hooksDir: string;
  configPath: string;
  root?: string;
}): Promise<{ snapshotDir: string; configFileName: string }> {
  const root = input.root ?? getHubRoot();
  const p = hubPaths(root);
  const configFileName = path.basename(input.configPath);
  const digest = crypto
    .createHash("sha1")
    .update(`${path.resolve(input.hooksDir)}\n${path.resolve(input.configPath)}`)
    .digest("hex")
    .slice(0, 12);
  const snapshotDir = path.join(p.hooksStore, "_imports", `${Date.now()}-${digest}`);

  await ensureDir(snapshotDir);
  await copyRecursive(path.resolve(input.hooksDir), path.join(snapshotDir, "hooks"));
  await copyRecursive(path.resolve(input.configPath), path.join(snapshotDir, configFileName));

  return { snapshotDir, configFileName };
}
