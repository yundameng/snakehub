import os from "node:os";
import path from "node:path";
import { pathExists } from "./fs-utils";
import { ResourceType, ToolAdapter } from "./types";

function userHomePath(...parts: string[]): string {
  return path.join(os.homedir(), ...parts);
}

function targetFor(base: string, type: ResourceType): string {
  return path.join(base, type);
}

const claudeBase = userHomePath(".claude");
const cursorBase = userHomePath(".cursor");
const codexBase = userHomePath(".codex");

export const TOOL_ADAPTERS: ToolAdapter[] = [
  {
    id: "claude",
    name: "Claude Code",
    configDirName: ".claude",
    supports: ["skills", "hooks", "agents", "commands", "rules"],
    detect: async () => pathExists(claudeBase),
    targetDir: (type: ResourceType) => targetFor(claudeBase, type),
  },
  {
    id: "cursor",
    name: "Cursor",
    configDirName: ".cursor",
    supports: ["skills", "hooks", "agents", "commands", "rules"],
    detect: async () => pathExists(cursorBase),
    targetDir: (type: ResourceType) => targetFor(cursorBase, type),
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    configDirName: ".codex",
    supports: ["skills", "hooks", "agents", "commands", "rules"],
    defaultEnabledTypes: ["skills", "commands", "rules"],
    detect: async () => pathExists(codexBase),
    targetDir: (type: ResourceType) => targetFor(codexBase, type),
  },
];

export function getAdapterOrThrow(toolId: string): ToolAdapter {
  const adapter = TOOL_ADAPTERS.find((item) => item.id === toolId);
  if (!adapter) {
    throw new Error(`Unknown tool '${toolId}'. Supported: ${TOOL_ADAPTERS.map((a) => a.id).join(", ")}`);
  }
  return adapter;
}

export async function detectedAdapters(): Promise<ToolAdapter[]> {
  const checks = await Promise.all(
    TOOL_ADAPTERS.map(async (adapter) => ({ adapter, detected: await adapter.detect() })),
  );
  return checks.filter((item) => item.detected).map((item) => item.adapter);
}
