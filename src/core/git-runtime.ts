import os from "node:os";
import path from "node:path";

function trimEnvValue(value: string | undefined): string {
  return (value ?? "").trim();
}

export function resolveGitEnv(baseEnv: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...baseEnv };
  const existingHome = trimEnvValue(env.HOME);
  const existingUserProfile = trimEnvValue(env.USERPROFILE);
  const fallbackHome = trimEnvValue(os.homedir());
  const resolvedHome = existingHome || existingUserProfile || fallbackHome;

  if (resolvedHome) {
    if (!existingHome) {
      env.HOME = resolvedHome;
    }
    if (!existingUserProfile) {
      env.USERPROFILE = resolvedHome;
    }
    if (!trimEnvValue(env.XDG_CONFIG_HOME)) {
      env.XDG_CONFIG_HOME = path.join(resolvedHome, ".config");
    }
  }

  return env;
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function isGitAuthError(error: unknown): boolean {
  const message = normalizeErrorMessage(error);
  return /The requested URL returned error:\s*(401|403)|Authentication failed|could not read Username|terminal prompts disabled|HTTP Basic: Access denied/i.test(
    message,
  );
}

export function buildSshFallbackRepoUrl(repoUrl: string): string | undefined {
  try {
    const parsed = new URL(repoUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }

    const repoPath = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    if (!parsed.hostname || !repoPath) {
      return undefined;
    }

    if (parsed.port) {
      return `ssh://git@${parsed.hostname}:${parsed.port}/${repoPath}`;
    }
    return `git@${parsed.hostname}:${repoPath}`;
  } catch {
    return undefined;
  }
}

function normalizeRepoPath(repoPath: string): string {
  return repoPath.replace(/^\/+/, "").replace(/\.git$/i, "").replace(/\/+$/, "");
}

function extractRepoLocator(repoValue: string): string {
  const value = repoValue.trim();
  if (!value) {
    return "";
  }

  if (/^[a-zA-Z]+:\/\//.test(value)) {
    try {
      const parsed = new URL(value);
      const repoPath = normalizeRepoPath(parsed.pathname);
      if (!parsed.hostname || !repoPath) {
        return "";
      }
      return `${parsed.hostname.toLowerCase()}/${repoPath}`;
    } catch {
      return "";
    }
  }

  const scpLike = value.match(/^(?:[^@]+@)?([^:/]+):(.+)$/);
  if (!scpLike) {
    return "";
  }

  const [, host, repoPathRaw] = scpLike;
  const repoPath = normalizeRepoPath(repoPathRaw);
  if (!host || !repoPath) {
    return "";
  }
  return `${host.toLowerCase()}/${repoPath}`;
}

export function isSameRepoRemote(left: string, right: string): boolean {
  const leftLocator = extractRepoLocator(left);
  const rightLocator = extractRepoLocator(right);
  return Boolean(leftLocator && rightLocator && leftLocator === rightLocator);
}

export function annotateGitError(error: unknown): Error {
  const baseMessage = normalizeErrorMessage(error);
  if (/The requested URL returned error:\s*403/i.test(baseMessage)) {
    return new Error(
      `${baseMessage}\nHint: git access was denied (HTTP 403). For private repos, configure git credentials in this account or use an SSH URL (git@host:group/repo.git).`,
    );
  }

  if (isGitAuthError(error)) {
    return new Error(
      `${baseMessage}\nHint: git authentication failed. Configure your git credential helper or switch to an SSH repo URL.`,
    );
  }

  return error instanceof Error ? error : new Error(baseMessage);
}
