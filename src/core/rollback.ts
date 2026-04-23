import { getHubRoot } from "./config";
import { movePath, pathExists, removePath } from "./fs-utils";
import { loadState, newId, nowIso, pushOperation, saveState } from "./state";

export async function rollbackLinkOperation(input: {
  operationId?: string;
  root?: string;
}): Promise<{ rolledBackOperationId: string; restoredBackup: boolean; linkPath: string }> {
  const root = input.root ?? getHubRoot();
  let state = await loadState(root);

  const targetOp = input.operationId
    ? state.operations.find((op) => op.id === input.operationId && op.type === "link")
    : [...state.operations].reverse().find((op) => op.type === "link");

  if (!targetOp) {
    throw new Error("No link operation found to rollback.");
  }

  const linkPath = String(targetOp.details.linkPath ?? "");
  const backupPath = targetOp.details.backupPath ? String(targetOp.details.backupPath) : "";
  const mappingId = targetOp.details.mappingId ? String(targetOp.details.mappingId) : "";

  if (!linkPath) {
    throw new Error("Target operation has no linkPath and cannot be rolled back.");
  }

  if (await pathExists(linkPath)) {
    await removePath(linkPath);
  }

  let restoredBackup = false;
  if (backupPath && (await pathExists(backupPath))) {
    await movePath(backupPath, linkPath);
    restoredBackup = true;
  }

  state = {
    ...state,
    mappings: state.mappings.map((mapping) => {
      if (mapping.id !== mappingId) {
        return mapping;
      }
      return { ...mapping, active: false };
    }),
  };

  const rollbackId = newId("op");
  state = pushOperation(state, {
    id: rollbackId,
    type: "rollback",
    createdAt: nowIso(),
    details: {
      sourceOperationId: targetOp.id,
      linkPath,
      backupPath: backupPath || undefined,
      restoredBackup,
    },
  });

  await saveState(state, root);

  return {
    rolledBackOperationId: targetOp.id,
    restoredBackup,
    linkPath,
  };
}
