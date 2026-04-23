import { execFile } from "node:child_process";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { ensureHubLayout, getHubRoot, hubPaths } from "../core/config";
import { detectProjectGlobalConflicts } from "../core/conflicts";
import { importFromRepo, inspectRepoForImport } from "../core/git-import";
import { archiveHooksWithConfig, resolveHooksConfigSibling } from "../core/hooks-config";
import { importResource } from "../core/importer";
import { linkResource, resolveResourceOrThrow } from "../core/linker";
import { listState } from "../core/list";
import { importRepoCandidatesToHub, scanRepoCandidates } from "../core/repo-sync";
import { normalizeResourceType } from "../core/resource-utils";
import { rollbackLinkOperation } from "../core/rollback";
import { scanTools } from "../core/scanner";
import { getEffectiveToolPathEntries, resolveTargetDir, setToolPathOverride, unsetToolPathOverride } from "../core/tool-paths";
import { ResourceType } from "../core/types";

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.COWHUB_DESKTOP_PORT || "4987");
const HOST = process.env.COWHUB_DESKTOP_HOST || "0.0.0.0";
const NO_BROWSER = process.env.COWHUB_DESKTOP_NO_BROWSER === "1";

function resolveWebRoot(): string {
  const candidates: string[] = [];

  if (process.env.COWHUB_WEB_ROOT) {
    candidates.push(path.resolve(process.env.COWHUB_WEB_ROOT));
  }

  candidates.push(path.resolve(process.cwd(), "desktop-ui"));
  candidates.push(path.resolve(__dirname, "../../desktop-ui"));

  const processWithResources = process as NodeJS.Process & { resourcesPath?: string };
  const resourcesPath = process.env.COWHUB_RESOURCES_PATH || processWithResources.resourcesPath;
  if (resourcesPath) {
    candidates.push(path.resolve(resourcesPath, "desktop-ui"));
    candidates.push(path.resolve(resourcesPath, "app.asar", "desktop-ui"));
    candidates.push(path.resolve(resourcesPath, "app.asar.unpacked", "desktop-ui"));
  }

  for (const candidate of candidates) {
    const indexPath = path.join(candidate, "index.html");
    if (fsSync.existsSync(indexPath)) {
      return candidate;
    }
  }

  return candidates[0] ?? path.resolve(process.cwd(), "desktop-ui");
}

const WEB_ROOT = resolveWebRoot();

interface JsonPayload {
  [key: string]: unknown;
}

function expandHome(inputPath: string): string {
  if (inputPath === "~") {
    return os.homedir();
  }
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

function normalizeLocalPath(inputPath: string): string {
  return path.resolve(expandHome(inputPath.trim()));
}

function normalizeRepoValue(inputValue: string): string {
  const value = inputValue.trim();
  if (/^[a-zA-Z]+:\/\//.test(value) || value.startsWith("git@")) {
    return value;
  }
  return normalizeLocalPath(value);
}

interface LocalBatchCandidate {
  sourcePath: string;
  name: string;
}

async function collectLocalBatchCandidates(type: ResourceType, sourceDir: string): Promise<LocalBatchCandidate[]> {
  const stat = await fs.stat(sourceDir);
  if (!stat.isDirectory()) {
    throw new Error(`sourcePath is not a directory: ${sourceDir}`);
  }

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const candidates: LocalBatchCandidate[] = [];

  if (type === "skills") {
    for (const entry of entries) {
      if (entry.name.startsWith(".") || !entry.isDirectory()) {
        continue;
      }
      const skillPath = path.join(sourceDir, entry.name);
      const skillFile = path.join(skillPath, "SKILL.md");
      const hasSkillFile = await fs
        .stat(skillFile)
        .then((item) => item.isFile())
        .catch(() => false);
      if (!hasSkillFile) {
        continue;
      }
      candidates.push({
        sourcePath: skillPath,
        name: entry.name,
      });
    }
  } else {
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const entryPath = path.join(sourceDir, entry.name);
      if (!entry.isDirectory() && !entry.isFile()) {
        continue;
      }
      candidates.push({
        sourcePath: entryPath,
        name: entry.isFile() ? path.parse(entry.name).name || entry.name : entry.name,
      });
    }
  }

  candidates.sort((a, b) => `${a.name}|${a.sourcePath}`.localeCompare(`${b.name}|${b.sourcePath}`));
  return candidates;
}

function hooksRootFromSourcePath(sourcePath: string): string {
  const resolved = path.resolve(sourcePath);
  return path.basename(resolved) === "hooks" ? resolved : path.dirname(resolved);
}

function expectedHooksConfigFileName(toolId: string): "settings.json" | "hooks.json" {
  return toolId === "claude" ? "settings.json" : "hooks.json";
}

function resolveLinkedTarget(linkPath: string, rawTarget: string): string {
  if (path.isAbsolute(rawTarget)) {
    return path.resolve(rawTarget);
  }
  return path.resolve(path.dirname(linkPath), rawTarget);
}

async function linkHooksConfigFile(input: {
  toolId: string;
  projectPath?: string;
  hooksSourceRoot: string;
  root?: string;
}): Promise<{ configPath: string; backupPath?: string; alreadyLinked: boolean }> {
  const root = input.root ?? getHubRoot();
  const expectedConfigName = expectedHooksConfigFileName(input.toolId);
  const sourceConfigPath = path.join(path.dirname(input.hooksSourceRoot), expectedConfigName);
  const sourceExists = await fs
    .stat(sourceConfigPath)
    .then((item) => item.isFile())
    .catch(() => false);
  if (!sourceExists) {
    throw new Error(
      `Missing hooks config file '${expectedConfigName}' beside '${input.hooksSourceRoot}'. Please add it before linking hooks.`,
    );
  }

  const resolvedHookTarget = await resolveTargetDir(input.toolId, "hooks", root, input.projectPath);
  if (!resolvedHookTarget.path) {
    throw new Error(`Tool '${input.toolId}' has no hooks target directory.`);
  }
  const configPath = path.join(path.dirname(resolvedHookTarget.path), expectedConfigName);
  await fs.mkdir(path.dirname(configPath), { recursive: true });

  let backupPath: string | undefined;
  const exists = await fs
    .lstat(configPath)
    .then(() => true)
    .catch(() => false);
  if (exists) {
    const stat = await fs.lstat(configPath);
    if (stat.isSymbolicLink()) {
      const rawTarget = await fs.readlink(configPath);
      const resolvedTarget = resolveLinkedTarget(configPath, rawTarget);
      if (resolvedTarget === path.resolve(sourceConfigPath)) {
        return { configPath, alreadyLinked: true };
      }
    }
    backupPath = path.join(hubPaths(root).backups, `cfg_${Date.now()}_${path.basename(configPath)}`);
    await fs.rename(configPath, backupPath);
  }

  await fs.symlink(path.resolve(sourceConfigPath), configPath, process.platform === "win32" ? "file" : undefined);
  return { configPath, backupPath, alreadyLinked: false };
}

async function linkHooksGroup(input: {
  resourceToken: string;
  toolId: string;
  projectPath?: string;
  root?: string;
}): Promise<{
  mode: "hooks-batch";
  hooksSourceRoot: string;
  attempted: number;
  linked: number;
  alreadyLinked: number;
  failed: Array<{ resourceId: string; name: string; error: string }>;
  config: { path: string; backupPath?: string; alreadyLinked: boolean };
}> {
  const root = input.root ?? getHubRoot();
  const state = await listState();
  const selected = resolveResourceOrThrow(state, input.resourceToken);
  if (selected.type !== "hooks") {
    throw new Error("Selected resource is not a hooks resource.");
  }

  const hooksSourceRoot = hooksRootFromSourcePath(selected.sourcePath);
  const candidates = state.resources
    .filter((resource) => resource.type === "hooks" && hooksRootFromSourcePath(resource.sourcePath) === hooksSourceRoot)
    .sort((a, b) => `${a.name}/${a.id}`.localeCompare(`${b.name}/${b.id}`));

  if (candidates.length === 0) {
    throw new Error(`No hooks resources found from source '${hooksSourceRoot}'.`);
  }

  const config = await linkHooksConfigFile({
    toolId: input.toolId,
    projectPath: input.projectPath,
    hooksSourceRoot,
    root,
  });

  let linked = 0;
  let alreadyLinked = 0;
  const failed: Array<{ resourceId: string; name: string; error: string }> = [];
  for (const resource of candidates) {
    try {
      const result = await linkResource({
        resourceToken: resource.id,
        toolId: input.toolId,
        projectPath: input.projectPath,
        root,
      });
      if (result.alreadyLinked) {
        alreadyLinked += 1;
      } else {
        linked += 1;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      failed.push({
        resourceId: resource.id,
        name: resource.name,
        error: message,
      });
    }
  }

  return {
    mode: "hooks-batch",
    hooksSourceRoot,
    attempted: candidates.length,
    linked,
    alreadyLinked,
    failed,
    config: {
      path: config.configPath,
      backupPath: config.backupPath,
      alreadyLinked: config.alreadyLinked,
    },
  };
}

function jsonResponse(res: http.ServerResponse, statusCode: number, payload: JsonPayload): void {
  const body = `${JSON.stringify(payload)}\n`;
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function textResponse(res: http.ServerResponse, statusCode: number, contentType: string, body: string): void {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function readJsonBody(req: http.IncomingMessage): Promise<JsonPayload> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    total += buf.length;
    if (total > 2 * 1024 * 1024) {
      throw new Error("Request body too large (max 2MB).");
    }
    chunks.push(buf);
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(body) as JsonPayload;
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

function isApiRequest(urlPath: string): boolean {
  return urlPath.startsWith("/api/");
}

function listLanIPv4Urls(port: number): string[] {
  const interfaces = os.networkInterfaces() as Record<
    string,
    Array<{ address: string; family: string | number; internal: boolean }> | undefined
  >;
  const urls: string[] = [];

  for (const addresses of Object.values(interfaces)) {
    if (!addresses) {
      continue;
    }
    for (const addr of addresses) {
      const family = typeof addr.family === "string" ? addr.family : String(addr.family);
      if (family !== "IPv4" || addr.internal) {
        continue;
      }
      urls.push(`http://${addr.address}:${port}`);
    }
  }

  return [...new Set(urls)];
}

function getOpenBrowserUrl(host: string, port: number): string {
  if (host === "0.0.0.0" || host === "::") {
    return `http://127.0.0.1:${port}`;
  }
  return `http://${host}:${port}`;
}

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string): Promise<void> {
  const method = req.method || "GET";

  if (method === "GET" && urlPath === "/api/overview") {
    const [state, scan, paths] = await Promise.all([listState(), scanTools(), getEffectiveToolPathEntries()]);
    jsonResponse(res, 200, { ok: true, state, scan, paths });
    return;
  }

  if (method === "GET" && urlPath === "/api/paths") {
    const paths = await getEffectiveToolPathEntries();
    jsonResponse(res, 200, { ok: true, paths });
    return;
  }

  if (method === "POST" && urlPath === "/api/tool-scan") {
    const body = await readJsonBody(req);
    const projectPath = body.projectPath ? normalizeLocalPath(String(body.projectPath)) : undefined;
    const [scan, paths] = await Promise.all([
      scanTools(undefined, projectPath),
      getEffectiveToolPathEntries(undefined, projectPath),
    ]);
    jsonResponse(res, 200, { ok: true, projectPath: projectPath || "", scan, paths });
    return;
  }

  if (method === "POST" && urlPath === "/api/conflicts") {
    const body = await readJsonBody(req);
    const projectPath = body.projectPath ? normalizeLocalPath(String(body.projectPath)) : undefined;
    const toolIdRaw = body.toolId ? String(body.toolId).trim() : "";
    const typeRaw = body.type ? String(body.type).trim() : "";
    const toolId = toolIdRaw || undefined;
    const type = typeRaw
      ? normalizeResourceType(typeRaw.endsWith("s") ? typeRaw.slice(0, -1) : typeRaw)
      : undefined;

    const conflicts = await detectProjectGlobalConflicts({
      projectPath,
      toolId,
      type,
    });
    jsonResponse(res, 200, { ok: true, projectPath: projectPath || "", conflicts });
    return;
  }

  if (method === "POST" && urlPath === "/api/import/local") {
    const body = await readJsonBody(req);
    const type = normalizeResourceType(String(body.type ?? ""));
    const sourcePath = normalizeLocalPath(String(body.sourcePath ?? ""));
    const name = body.name ? String(body.name) : undefined;

    if (type === "hooks") {
      throw new Error(
        "Hooks can only be imported as a full set. Use bulk hooks import with the hooks directory (including sibling hooks.json/settings.json).",
      );
    }

    const result = await importResource({ type, sourcePath, name });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/import/local/batch") {
    const body = await readJsonBody(req);
    const type = normalizeResourceType(String(body.type ?? ""));
    const sourcePath = normalizeLocalPath(String(body.sourcePath ?? ""));
    const candidates = await collectLocalBatchCandidates(type, sourcePath);
    if (candidates.length === 0) {
      throw new Error(`No ${type} candidates found under: ${sourcePath}`);
    }

    let hooksSnapshot:
      | {
          snapshotDir: string;
          configFileName: string;
        }
      | undefined;
    if (type === "hooks") {
      if (path.basename(sourcePath) !== "hooks") {
        throw new Error("Hooks bulk import expects a hooks directory path (e.g. .../.cursor/hooks).");
      }
      const resolved = await resolveHooksConfigSibling(sourcePath);
      hooksSnapshot = await archiveHooksWithConfig({
        hooksDir: resolved.hooksDir,
        configPath: resolved.configPath,
      });
    }

    const imported: Array<{ name: string; sourcePath: string; reused: boolean; resourceId: string }> = [];
    for (const candidate of candidates) {
      const importedResult = await importResource({
        type,
        sourcePath: candidate.sourcePath,
        name: candidate.name,
      });
      imported.push({
        name: candidate.name,
        sourcePath: candidate.sourcePath,
        reused: importedResult.reused,
        resourceId: importedResult.resource.id,
      });
    }

    const reused = imported.filter((item) => item.reused).length;
    jsonResponse(res, 200, {
      ok: true,
      result: {
        attempted: candidates.length,
        imported: imported.length,
        reused,
        created: imported.length - reused,
        items: imported,
        hooksSnapshot,
      },
    });
    return;
  }

  if (method === "POST" && urlPath === "/api/repo/scan") {
    const body = await readJsonBody(req);
    const repoUrlRaw = String(body.repoUrl ?? "").trim();
    const ref = body.ref ? String(body.ref) : undefined;
    const targetPath = body.targetPath ? normalizeLocalPath(String(body.targetPath)) : undefined;
    const repoPath = body.repoPath ? normalizeLocalPath(String(body.repoPath)) : undefined;
    const multiToolset = Boolean(body.multiToolset);

    if (!repoUrlRaw && !repoPath) {
      throw new Error("repoUrl or repoPath is required.");
    }

    const repoUrl = repoUrlRaw ? normalizeRepoValue(repoUrlRaw) : undefined;
    const result = await scanRepoCandidates({
      repoUrl,
      repoPath,
      ref,
      targetPath,
      multiToolset,
    });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/repo/import-selected") {
    const body = await readJsonBody(req);
    const repoPath = normalizeLocalPath(String(body.repoPath ?? ""));
    const selectedKeys = Array.isArray(body.selectedKeys)
      ? body.selectedKeys.map((item) => String(item))
      : [];
    const multiToolset = Boolean(body.multiToolset);

    if (!repoPath || selectedKeys.length === 0) {
      throw new Error("repoPath and selectedKeys are required.");
    }

    const result = await importRepoCandidatesToHub({
      repoPath,
      selectedKeys,
      multiToolset,
    });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/import/manual") {
    const body = await readJsonBody(req);
    const type = normalizeResourceType(String(body.type ?? ""));
    const name = String(body.name ?? "").trim();
    const content = String(body.content ?? "");
    const fileNameRaw = String(body.fileName ?? "").trim();

    if (!name) {
      throw new Error("name is required.");
    }

    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "snakehub-manual-"));
    try {
      const fileName =
        fileNameRaw ||
        (type === "skills"
          ? "SKILL.md"
          : type === "hooks"
            ? "hook.txt"
            : type === "agents"
              ? "agent.txt"
              : "command.txt");
      const targetFile = path.join(tempRoot, fileName);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.writeFile(targetFile, content, "utf8");

      const result = await importResource({
        type,
        sourcePath: tempRoot,
        name,
      });
      jsonResponse(res, 200, { ok: true, result });
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
    return;
  }

  if (method === "POST" && urlPath === "/api/import/git/candidates") {
    const body = await readJsonBody(req);
    const type = normalizeResourceType(String(body.type ?? ""));
    const repoUrl = normalizeRepoValue(String(body.repoUrl ?? ""));
    const ref = body.ref ? String(body.ref) : undefined;
    const select = body.select ? String(body.select) : undefined;

    const result = await inspectRepoForImport({ type, repoUrl, ref, select });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/import/git") {
    const body = await readJsonBody(req);
    const type = normalizeResourceType(String(body.type ?? ""));
    const repoUrl = normalizeRepoValue(String(body.repoUrl ?? ""));
    const ref = body.ref ? String(body.ref) : undefined;
    const select = body.select ? String(body.select) : undefined;
    const all = Boolean(body.all);
    const name = body.name ? String(body.name) : undefined;

    const result = await importFromRepo({ type, repoUrl, ref, select, all, name });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/link") {
    const body = await readJsonBody(req);
    const resourceToken = String(body.resourceToken ?? "").trim();
    const toolId = String(body.toolId ?? "").trim();
    const aliasName = body.aliasName ? String(body.aliasName) : undefined;
    const projectPath = body.projectPath ? normalizeLocalPath(String(body.projectPath)) : undefined;

    if (!resourceToken || !toolId) {
      throw new Error("resourceToken and toolId are required.");
    }

    const state = await listState();
    const selected = resolveResourceOrThrow(state, resourceToken);
    if (selected.type === "hooks") {
      if (aliasName && aliasName.trim()) {
        throw new Error("Hooks linking is batch-only and does not support aliasName.");
      }
      const result = await linkHooksGroup({ resourceToken, toolId, projectPath });
      jsonResponse(res, 200, { ok: true, result });
      return;
    }

    const result = await linkResource({ resourceToken, toolId, aliasName, projectPath });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/link/batch") {
    const body = await readJsonBody(req);
    const toolId = String(body.toolId ?? "").trim();
    const projectPath = body.projectPath ? normalizeLocalPath(String(body.projectPath)) : undefined;
    const rawTypes = Array.isArray(body.types) ? body.types.map((item) => String(item)) : [];
    const normalizedTypes = new Set(rawTypes.map((item) => normalizeResourceType(item)));

    if (!toolId) {
      throw new Error("toolId is required.");
    }
    if (normalizedTypes.size === 0) {
      throw new Error("types is required.");
    }

    const state = await listState();
    const includesHooks = normalizedTypes.has("hooks");
    let hooksSourcePath = "";
    let hooksSourceRoot = "";
    if (includesHooks) {
      hooksSourcePath = String(body.hooksSourcePath ?? "").trim();
      if (!hooksSourcePath) {
        throw new Error("hooksSourcePath is required when types include hooks.");
      }
      hooksSourceRoot = hooksRootFromSourcePath(normalizeLocalPath(hooksSourcePath));
    }

    const candidates = state.resources
      .filter((resource) => {
        if (!normalizedTypes.has(resource.type)) {
          return false;
        }
        if (resource.type !== "hooks") {
          return true;
        }
        return hooksRootFromSourcePath(resource.sourcePath) === hooksSourceRoot;
      })
      .sort((a, b) => `${a.type}/${a.name}/${a.id}`.localeCompare(`${b.type}/${b.name}/${b.id}`));

    const hookCandidates = includesHooks ? candidates.filter((resource) => resource.type === "hooks") : [];
    if (includesHooks && hookCandidates.length === 0) {
      throw new Error(`No hooks resources found from source '${hooksSourceRoot}'.`);
    }

    if (candidates.length === 0) {
      jsonResponse(res, 200, {
        ok: true,
        result: {
          attempted: 0,
          linked: 0,
          alreadyLinked: 0,
          failed: [],
        },
      });
      return;
    }

    let linked = 0;
    let alreadyLinked = 0;
    const failed: Array<{ resourceId: string; name: string; type: string; error: string }> = [];
    let hooksConfig:
      | {
          path: string;
          backupPath?: string;
          alreadyLinked: boolean;
        }
      | undefined;
    if (includesHooks) {
      const linkedConfig = await linkHooksConfigFile({
        toolId,
        projectPath,
        hooksSourceRoot,
      });
      hooksConfig = {
        path: linkedConfig.configPath,
        backupPath: linkedConfig.backupPath,
        alreadyLinked: linkedConfig.alreadyLinked,
      };
    }

    for (const resource of candidates) {
      try {
        const linkedResult = await linkResource({
          resourceToken: resource.id,
          toolId,
          projectPath,
        });
        if (linkedResult.alreadyLinked) {
          alreadyLinked += 1;
        } else {
          linked += 1;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        failed.push({
          resourceId: resource.id,
          name: resource.name,
          type: resource.type,
          error: message,
        });
      }
    }

    jsonResponse(res, 200, {
      ok: true,
      result: {
        attempted: candidates.length,
        linked,
        alreadyLinked,
        failed,
        hooksConfig,
      },
    });
    return;
  }

  if (method === "POST" && urlPath === "/api/rollback") {
    const body = await readJsonBody(req);
    const operationId = body.operationId ? String(body.operationId) : undefined;
    const result = await rollbackLinkOperation({ operationId });
    jsonResponse(res, 200, { ok: true, result });
    return;
  }

  if (method === "POST" && urlPath === "/api/paths/set") {
    const body = await readJsonBody(req);
    const toolId = String(body.toolId ?? "").trim();
    const type = normalizeResourceType(String(body.type ?? ""));
    const targetPath = normalizeLocalPath(String(body.targetPath ?? ""));

    if (!toolId || !targetPath) {
      throw new Error("toolId, type, and targetPath are required.");
    }

    const normalizedPath = await setToolPathOverride({ toolId, type, targetPath });
    jsonResponse(res, 200, { ok: true, normalizedPath });
    return;
  }

  if (method === "POST" && urlPath === "/api/paths/unset") {
    const body = await readJsonBody(req);
    const toolId = String(body.toolId ?? "").trim();
    const type = normalizeResourceType(String(body.type ?? ""));

    if (!toolId) {
      throw new Error("toolId and type are required.");
    }

    await unsetToolPathOverride({ toolId, type });
    jsonResponse(res, 200, { ok: true });
    return;
  }

  jsonResponse(res, 404, { ok: false, error: `Unknown API route: ${method} ${urlPath}` });
}

function contentTypeByFile(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "text/plain; charset=utf-8";
}

async function handleStatic(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string): Promise<void> {
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const safeRel = path.normalize(requested).replace(/^\.\.(\/|\\|$)+/, "");
  const filePath = path.join(WEB_ROOT, safeRel);

  if (!filePath.startsWith(WEB_ROOT)) {
    textResponse(res, 403, "text/plain; charset=utf-8", "Forbidden\n");
    return;
  }

  try {
    const content = await fs.readFile(filePath, "utf8");
    textResponse(res, 200, contentTypeByFile(filePath), content);
  } catch {
    textResponse(res, 404, "text/plain; charset=utf-8", "Not Found\n");
  }
}

async function openBrowser(url: string): Promise<void> {
  try {
    if (process.platform === "darwin") {
      await execFileAsync("open", [url]);
      return;
    }
    if (process.platform === "win32") {
      await execFileAsync("cmd", ["/c", "start", "", url]);
      return;
    }
    await execFileAsync("xdg-open", [url]);
  } catch {
    // Ignore launch failures; URL is printed to stdout.
  }
}

async function start(): Promise<void> {
  await ensureHubLayout();
  process.stdout.write(`SnakeHub Desktop web root: ${WEB_ROOT}\n`);

  const server = http.createServer(async (req, res) => {
    const rawUrl = req.url || "/";
    const parsed = new URL(rawUrl, `http://${HOST}:${PORT}`);

    try {
      if (isApiRequest(parsed.pathname)) {
        await handleApi(req, res, parsed.pathname);
        return;
      }

      await handleStatic(req, res, parsed.pathname);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      jsonResponse(res, 400, { ok: false, error: message });
    }
  });

  server.listen(PORT, HOST, async () => {
    const browserUrl = getOpenBrowserUrl(HOST, PORT);
    process.stdout.write(`SnakeHub Desktop running at ${browserUrl}\n`);

    const lanUrls = listLanIPv4Urls(PORT);
    if (HOST === "0.0.0.0" || HOST === "::") {
      if (lanUrls.length > 0) {
        process.stdout.write("SnakeHub Desktop LAN URLs:\n");
        for (const url of lanUrls) {
          process.stdout.write(`  - ${url}\n`);
        }
      } else {
        process.stdout.write("SnakeHub Desktop LAN URLs: none detected\n");
      }
    }

    if (!NO_BROWSER) {
      await openBrowser(browserUrl);
    }
  });
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Failed to start desktop server: ${message}\n`);
  process.exit(1);
});
