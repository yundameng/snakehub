import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

function trimEnvValue(value: string | undefined): string {
  return (value ?? "").trim();
}

function resolveLaunchctlEnv(name: string): string {
  try {
    const raw = execFileSync("launchctl", ["getenv", name], {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    });
    return trimEnvValue(raw);
  } catch {
    return "";
  }
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

  // GUI-launched apps on macOS may miss SSH_AUTH_SOCK even when Terminal has it.
  // Pulling it from launchd lets git/ssh reach the user's agent keys.
  if (process.platform === "darwin" && !trimEnvValue(env.SSH_AUTH_SOCK)) {
    const launchdSock = resolveLaunchctlEnv("SSH_AUTH_SOCK");
    if (launchdSock) {
      env.SSH_AUTH_SOCK = launchdSock;
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
  return /The requested URL returned error:\s*(401|403)|Authentication failed|could not read Username|terminal prompts disabled|HTTP Basic: Access denied|Permission denied \(publickey\)|Could not read from remote repository|Repository not found|fatal: could not read Password/i.test(
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

function parseSshRepoUrl(
  repoUrl: string,
): {
  host: string;
  port?: string;
  repoPath: string;
} | undefined {
  const value = repoUrl.trim();
  if (!value) {
    return undefined;
  }

  if (value.startsWith("ssh://")) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "ssh:") {
        return undefined;
      }
      const repoPath = normalizeRepoPath(parsed.pathname);
      if (!parsed.hostname || !repoPath) {
        return undefined;
      }
      return {
        host: parsed.hostname.toLowerCase(),
        port: parsed.port || undefined,
        repoPath,
      };
    } catch {
      return undefined;
    }
  }

  if (/^[a-zA-Z]+:\/\//.test(value)) {
    return undefined;
  }

  const scpLike = value.match(/^(?:[^@]+@)?([^:/]+):(.+)$/);
  if (!scpLike) {
    return undefined;
  }
  const [, host, repoPathRaw] = scpLike;
  const repoPath = normalizeRepoPath(repoPathRaw);
  if (!host || !repoPath) {
    return undefined;
  }

  return {
    host: host.toLowerCase(),
    repoPath,
  };
}

export function buildHttpsFallbackRepoUrl(repoUrl: string): string | undefined {
  const parsed = parseSshRepoUrl(repoUrl);
  if (!parsed) {
    return undefined;
  }
  const port = parsed.port ? `:${parsed.port}` : "";
  return `https://${parsed.host}${port}/${parsed.repoPath}`;
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

  if (/Permission denied \(publickey\)/i.test(baseMessage)) {
    return new Error(
      `${baseMessage}\nHint: SSH authentication failed. If command-line git works but desktop app fails, ensure ssh-agent key access is available to GUI apps (SSH_AUTH_SOCK), or switch to an HTTPS repo URL.`,
    );
  }

  if (isGitAuthError(error)) {
    return new Error(
      `${baseMessage}\nHint: git authentication failed. Configure HTTPS credentials (credential helper/token), or configure SSH key access.`,
    );
  }

  return error instanceof Error ? error : new Error(baseMessage);
}
