import path from "node:path";
import { ResourceType } from "./types";

export function normalizeResourceType(input: string): ResourceType {
  const value = input.trim().toLowerCase();
  if (value === "skill" || value === "skills") {
    return "skills";
  }
  if (value === "hook" || value === "hooks") {
    return "hooks";
  }
  if (value === "agent" || value === "agents") {
    return "agents";
  }
  if (value === "command" || value === "commands") {
    return "commands";
  }
  if (value === "rule" || value === "rules") {
    return "rules";
  }
  throw new Error(`Unknown resource type '${input}'. Use: skill|hook|agent|command|rule`);
}

export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .slice(0, 80);
}

export function inferResourceName(fromPath: string): string {
  const abs = path.resolve(fromPath);
  return path.basename(abs);
}
