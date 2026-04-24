import path from "node:path";
import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import { copyRecursive, ensureDir, isDirectory } from "./fs-utils";
import { fingerprintPath } from "./fingerprint";
import { inferResourceName, slugifyName } from "./resource-utils";
import { loadState, newId, nowIso, pushOperation, pushResource, saveState } from "./state";
import { ResourceRecord, ResourceType } from "./types";

function storeRootForType(type: ResourceType, root: string): string {
  const p = hubPaths(root);
  if (type === "skills") return p.skillsStore;
  if (type === "hooks") return p.hooksStore;
  if (type === "agents") return p.agentsStore;
  if (type === "rules") return p.rulesStore;
  return p.commandsStore;
}

export async function importResource(input: {
  sourcePath: string;
  type: ResourceType;
  name?: string;
  root?: string;
}): Promise<{ reused: boolean; resource: ResourceRecord }> {
  const root = input.root ?? getHubRoot();
  await ensureHubLayout(root);

  const absSource = path.resolve(input.sourcePath);
  const chosenName = input.name?.trim() || inferResourceName(absSource);
  const { fingerprint } = await fingerprintPath(absSource);
  let state = await loadState(root);

  const existing = state.resources.find(
    (r) => r.type === input.type && r.fingerprint === fingerprint,
  );

  if (existing) {
    return { reused: true, resource: existing };
  }

  const id = newId(input.type.slice(0, -1));
  const slug = slugifyName(chosenName) || id;
  const storeDir = path.join(storeRootForType(input.type, root), `${id}-${slug}`);
  await ensureDir(storeDir);

  if (await isDirectory(absSource)) {
    await copyRecursive(absSource, storeDir);
  } else {
    await copyRecursive(absSource, path.join(storeDir, path.basename(absSource)));
  }

  const resource: ResourceRecord = {
    id,
    type: input.type,
    name: chosenName,
    fingerprint,
    sourcePath: absSource,
    storePath: storeDir,
    createdAt: nowIso(),
  };

  state = pushResource(state, resource);
  state = pushOperation(state, {
    id: newId("op"),
    type: "import",
    createdAt: nowIso(),
    details: {
      resourceId: resource.id,
      sourcePath: resource.sourcePath,
      storePath: resource.storePath,
      reused: false,
    },
  });
  await saveState(state, root);

  return { reused: false, resource };
}
