import { getHubRoot } from "./config";
import { loadState } from "./state";

export async function listState(root = getHubRoot()) {
  const state = await loadState(root);
  return state;
}
