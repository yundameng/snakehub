#!/usr/bin/env node

import { ensureHubLayout, getHubRoot } from "./core/config";
import { fingerprintPath } from "./core/fingerprint";
import { importFromRepo, inspectRepoForImport } from "./core/git-import";
import { importResource } from "./core/importer";
import { linkResource } from "./core/linker";
import { listState } from "./core/list";
import { normalizeResourceType } from "./core/resource-utils";
import { rollbackLinkOperation } from "./core/rollback";
import { scanTools } from "./core/scanner";
import { getEffectiveToolPathEntries, setToolPathOverride, unsetToolPathOverride } from "./core/tool-paths";

type FlagValue = string | boolean;

interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, FlagValue>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, FlagValue> = {};

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    i += 1;
  }

  return { command, positional, flags };
}

function getStringFlag(flags: Record<string, FlagValue>, key: string): string | undefined {
  const value = flags[key];
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function printHelp(): void {
  const root = getHubRoot();
  const help = `
SnakeHub CLI (MVP)

Hub root: ${root}

Commands:
  snakehub init
  snakehub scan [--json]
  snakehub fingerprint <path>
  snakehub import --type <skill|hook|agent|command|rule> --from <path> [--name <name>]
  snakehub import-git --type <skill|hook|agent|command|rule> --repo <url_or_path> [--ref <ref>] [--select <path_or_name>] [--all] [--list]
  snakehub list [--json]
  snakehub paths [--json]
  snakehub paths set --tool <claude|cursor|codex|opencow> --type <skill|hook|agent|command|rule> --path <dir>
  snakehub paths unset --tool <claude|cursor|codex|opencow> --type <skill|hook|agent|command|rule>
  snakehub link --resource <resource_id_or_name> --tool <claude|cursor|codex|opencow> [--as <name>]
  snakehub rollback [--op <operation_id>]
`;
  process.stdout.write(help);
}

async function run(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h") {
    printHelp();
    return;
  }

  if (parsed.command === "init") {
    await ensureHubLayout();
    process.stdout.write(`Initialized snakehub at ${getHubRoot()}\n`);
    return;
  }

  if (parsed.command === "fingerprint") {
    const inputPath = parsed.positional[0];
    if (!inputPath) {
      throw new Error("Usage: snakehub fingerprint <path>");
    }

    const result = await fingerprintPath(inputPath);
    process.stdout.write(`${result.fingerprint}\n`);
    process.stdout.write(`files: ${result.files.length}\n`);
    return;
  }

  if (parsed.command === "import") {
    const typeRaw = getStringFlag(parsed.flags, "type");
    const from = getStringFlag(parsed.flags, "from");
    const name = getStringFlag(parsed.flags, "name");

    if (!typeRaw || !from) {
      throw new Error("Usage: snakehub import --type <skill|hook|agent|command|rule> --from <path> [--name <name>]");
    }

    const result = await importResource({
      type: normalizeResourceType(typeRaw),
      sourcePath: from,
      name,
    });

    if (result.reused) {
      process.stdout.write(`Reused existing resource: ${result.resource.id} (${result.resource.name})\n`);
      return;
    }

    process.stdout.write(`Imported resource: ${result.resource.id} (${result.resource.name})\n`);
    process.stdout.write(`Stored at: ${result.resource.storePath}\n`);
    return;
  }

  if (parsed.command === "import-git") {
    const typeRaw = getStringFlag(parsed.flags, "type");
    const repoUrl = getStringFlag(parsed.flags, "repo");
    const ref = getStringFlag(parsed.flags, "ref");
    const select = getStringFlag(parsed.flags, "select");
    const name = getStringFlag(parsed.flags, "name");
    const all = Boolean(parsed.flags.all);
    const listOnly = Boolean(parsed.flags.list);

    if (!typeRaw || !repoUrl) {
      throw new Error(
        "Usage: snakehub import-git --type <skill|hook|agent|command|rule> --repo <url_or_path> [--ref <ref>] [--select <path_or_name>] [--all] [--list]",
      );
    }

    const type = normalizeResourceType(typeRaw);

    if (listOnly) {
      const result = await inspectRepoForImport({
        type,
        repoUrl,
        ref,
        select,
      });

      if (parsed.flags.json) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        return;
      }

      process.stdout.write(`Candidates (${result.candidates.length}) from ${repoUrl}\n`);
      for (const candidate of result.candidates) {
        process.stdout.write(`- ${candidate.relativePath} (${candidate.name})\n`);
      }
      return;
    }

    const result = await importFromRepo({
      type,
      repoUrl,
      ref,
      select,
      all,
      name,
    });

    process.stdout.write(
      `Imported from repo: ${result.repoUrl} (candidates=${result.candidates.length}, selected=${result.selectedCandidates.length})\n`,
    );
    for (const item of result.imported) {
      const mode = item.reused ? "reused" : "imported";
      process.stdout.write(
        `- ${item.candidate.relativePath} -> ${item.resourceId} (${item.resourceName}) [${mode}]\n`,
      );
    }
    return;
  }

  if (parsed.command === "list") {
    const state = await listState();
    if (parsed.flags.json) {
      process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
      return;
    }

    process.stdout.write(`Resources: ${state.resources.length}\n`);
    for (const r of state.resources) {
      process.stdout.write(`- ${r.id} | ${r.type} | ${r.name}\n`);
    }
    process.stdout.write(`Mappings: ${state.mappings.length}\n`);
    process.stdout.write(`Operations: ${state.operations.length}\n`);
    return;
  }

  if (parsed.command === "scan") {
    const scanned = await scanTools();
    if (parsed.flags.json) {
      process.stdout.write(`${JSON.stringify(scanned, null, 2)}\n`);
      return;
    }

    for (const tool of scanned) {
      if (!tool.detected) {
        process.stdout.write(`- ${tool.toolName} (${tool.toolId}): not detected\n`);
        continue;
      }

      const dupCount = tool.assets.filter((a) => a.duplicateResourceId).length;
      process.stdout.write(
        `- ${tool.toolName} (${tool.toolId}): detected, assets=${tool.assets.length}, duplicateCandidates=${dupCount}\n`,
      );
      for (const asset of tool.assets) {
        if (asset.duplicateResourceId) {
          process.stdout.write(
            `  * ${asset.type}/${asset.name} -> duplicate of ${asset.duplicateResourceId}\n`,
          );
        }
      }
    }
    return;
  }

  if (parsed.command === "paths") {
    const action = parsed.positional[0] ?? "list";
    if (action === "list") {
      const entries = await getEffectiveToolPathEntries();
      if (parsed.flags.json) {
        process.stdout.write(`${JSON.stringify(entries, null, 2)}\n`);
        return;
      }

      const order = ["claude", "cursor", "codex", "opencow"];
      for (const toolId of order) {
        const toolEntries = entries.filter((entry) => entry.toolId === toolId);
        if (toolEntries.length === 0) {
          continue;
        }
        process.stdout.write(`${toolEntries[0].toolName} (${toolId})\n`);
        for (const entry of toolEntries) {
          const label = entry.type.slice(0, -1);
          if (!entry.path) {
            process.stdout.write(`  - ${label}: disabled (${entry.source})\n`);
            continue;
          }
          process.stdout.write(`  - ${label}: ${entry.path} (${entry.source})\n`);
        }
      }
      return;
    }

    if (action === "set") {
      const toolId = getStringFlag(parsed.flags, "tool");
      const typeRaw = getStringFlag(parsed.flags, "type");
      const targetPath = getStringFlag(parsed.flags, "path");
      if (!toolId || !typeRaw || !targetPath) {
        throw new Error(
          "Usage: snakehub paths set --tool <claude|cursor|codex|opencow> --type <skill|hook|agent|command|rule> --path <dir>",
        );
      }
      const type = normalizeResourceType(typeRaw);
      const normalizedPath = await setToolPathOverride({ toolId, type, targetPath });
      process.stdout.write(`Set path: tool=${toolId} type=${type} path=${normalizedPath}\n`);
      return;
    }

    if (action === "unset") {
      const toolId = getStringFlag(parsed.flags, "tool");
      const typeRaw = getStringFlag(parsed.flags, "type");
      if (!toolId || !typeRaw) {
        throw new Error("Usage: snakehub paths unset --tool <claude|cursor|codex|opencow> --type <skill|hook|agent|command|rule>");
      }
      const type = normalizeResourceType(typeRaw);
      await unsetToolPathOverride({ toolId, type });
      process.stdout.write(`Unset path override: tool=${toolId} type=${type}\n`);
      return;
    }

    throw new Error("Usage: snakehub paths [--json] | snakehub paths set ... | snakehub paths unset ...");
  }

  if (parsed.command === "link") {
    const resourceToken = getStringFlag(parsed.flags, "resource");
    const toolId = getStringFlag(parsed.flags, "tool");
    const aliasName = getStringFlag(parsed.flags, "as");

    if (!resourceToken || !toolId) {
      throw new Error(
        "Usage: snakehub link --resource <resource_id_or_name> --tool <claude|cursor|codex|opencow> [--as <name>]",
      );
    }

    const result = await linkResource({
      resourceToken,
      toolId,
      aliasName,
    });

    if (result.alreadyLinked) {
      process.stdout.write(`Already linked: ${result.mapping.linkPath}\n`);
      return;
    }

    process.stdout.write(`Linked: ${result.mapping.linkPath} -> ${result.mapping.targetPath}\n`);
    if (result.backupPath) {
      process.stdout.write(`Backup: ${result.backupPath}\n`);
    }
    process.stdout.write(`Operation: ${result.operationId}\n`);
    return;
  }

  if (parsed.command === "rollback") {
    const operationId = getStringFlag(parsed.flags, "op");
    const result = await rollbackLinkOperation({ operationId });
    process.stdout.write(`Rolled back link operation: ${result.rolledBackOperationId}\n`);
    process.stdout.write(`Link path: ${result.linkPath}\n`);
    process.stdout.write(`Restored backup: ${result.restoredBackup ? "yes" : "no"}\n`);
    return;
  }

  throw new Error(`Unknown command '${parsed.command}'. Run 'snakehub help'.`);
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
});
