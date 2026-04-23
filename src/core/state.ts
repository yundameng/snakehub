import crypto from "node:crypto";
import { ensureHubLayout, getHubRoot, hubPaths } from "./config";
import { readJsonFile, writeJsonFile } from "./fs-utils";
import { MappingRecord, OperationRecord, ResourceRecord, State } from "./types";

function emptyState(): State {
  return {
    version: 1,
    resources: [],
    mappings: [],
    operations: [],
  };
}

export async function loadState(root = getHubRoot()): Promise<State> {
  await ensureHubLayout(root);
  const { state } = hubPaths(root);
  return readJsonFile<State>(state, emptyState());
}

export async function saveState(nextState: State, root = getHubRoot()): Promise<void> {
  const { state } = hubPaths(root);
  await writeJsonFile(state, nextState);
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function pushResource(state: State, resource: ResourceRecord): State {
  return { ...state, resources: [...state.resources, resource] };
}

export function pushMapping(state: State, mapping: MappingRecord): State {
  return { ...state, mappings: [...state.mappings, mapping] };
}

export function pushOperation(state: State, operation: OperationRecord): State {
  return { ...state, operations: [...state.operations, operation] };
}
