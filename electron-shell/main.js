const { app, BrowserWindow, dialog, shell, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

let mainWindow = null;
let serverProcess = null;
let serverPort = null;
let terminalProcess = null;
let terminalOwnerWebContentsId = 0;

function getNodeBin() {
  return process.execPath;
}

function getRuntimeBaseDir() {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.resolve(__dirname, "..");
}

function buildRepoId(repoUrl) {
  const source = String(repoUrl || "").trim();
  const cleaned = source
    .replace(/\.git$/i, "")
    .replace(/^[a-zA-Z]+:\/\//, "")
    .replace(/^git@/, "")
    .replace(/[\\/:@]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    .toLowerCase();
  const hash = crypto.createHash("sha1").update(source).digest("hex").slice(0, 8);
  return `${cleaned || "repo"}-${hash}`;
}

function resolveServerEntry() {
  if (!app.isPackaged) {
    return path.join(getRuntimeBaseDir(), "dist", "desktop", "server.js");
  }

  const appPath = app.getAppPath();
  const candidates = [
    path.join(appPath, "dist", "desktop", "server.js"),
    path.join(process.resourcesPath, "app.asar", "dist", "desktop", "server.js"),
    path.join(process.resourcesPath, "app.asar.unpacked", "dist", "desktop", "server.js"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not allocate port.")));
        return;
      }
      const { port } = address;
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(port);
      });
    });
  });
}

function waitForServerReady(port, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(
        {
          host: "127.0.0.1",
          port,
          path: "/api/overview",
          timeout: 1200,
        },
        (res) => {
          res.resume();
          if (res.statusCode === 200) {
            resolve();
            return;
          }
          if (Date.now() - startedAt > timeoutMs) {
            reject(new Error(`Desktop server did not become ready (status=${res.statusCode}).`));
            return;
          }
          setTimeout(check, 250);
        },
      );

      req.on("timeout", () => {
        req.destroy(new Error("timeout"));
      });

      req.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Desktop server startup timed out."));
          return;
        }
        setTimeout(check, 250);
      });
    };

    check();
  });
}

function startDesktopServer(port) {
  return new Promise((resolve, reject) => {
    const runCwd = getRuntimeBaseDir();
    const serverEntry = resolveServerEntry();
    const webRoot = app.isPackaged
      ? path.join(app.getAppPath(), "desktop-ui")
      : path.join(getRuntimeBaseDir(), "desktop-ui");

    const child = spawn(getNodeBin(), [serverEntry], {
      cwd: runCwd,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        COWHUB_DESKTOP_PORT: String(port),
        COWHUB_DESKTOP_NO_BROWSER: "1",
        COWHUB_WEB_ROOT: webRoot,
        COWHUB_RESOURCES_PATH: process.resourcesPath || "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderrLog = "";
    child.stdout.on("data", (chunk) => {
      process.stdout.write(`[desktop-server] ${chunk}`);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderrLog += text;
      process.stderr.write(`[desktop-server] ${text}`);
    });

    child.once("error", (err) => {
      reject(err);
    });

    child.once("exit", (code, signal) => {
      if (code === 0 || signal === "SIGTERM") {
        return;
      }
      reject(new Error(`Desktop server exited early (code=${code}, signal=${signal}). ${stderrLog}`));
    });

    resolve(child);
  });
}

async function createMainWindow() {
  const port = await findFreePort();
  serverPort = port;

  serverProcess = await startDesktopServer(port);
  await waitForServerReady(port);

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    roundedCorners: true,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    title: "SnakeHub Desktop",
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const appUrl = `http://127.0.0.1:${port}`;

  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await mainWindow.loadURL(appUrl);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.handle("cowhub:pick-directory", async () => {
  const focusedWindow = BrowserWindow.getFocusedWindow() || mainWindow || undefined;
  const result = await dialog.showOpenDialog(focusedWindow, {
    title: "选择下载目录",
    properties: ["openDirectory", "createDirectory", "dontAddToRecent"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return "";
  }

  return result.filePaths[0];
});

ipcMain.handle("cowhub:path-info", async (_event, targetPath) => {
  const input = String(targetPath || "").trim();
  if (!input) {
    return { exists: false, isDirectory: false, hasImportDirs: false };
  }
  const absolute = path.resolve(input);
  try {
    const stat = await fs.promises.stat(absolute);
    if (!stat.isDirectory()) {
      return { exists: true, isDirectory: false, hasImportDirs: false };
    }
    const names = await fs.promises.readdir(absolute);
    const expected = new Set(["skills", "commands", "hooks", "rules", "docs"]);
    const hasImportDirs = names.some((name) => expected.has(String(name || "").toLowerCase()));
    return { exists: true, isDirectory: true, hasImportDirs };
  } catch {
    return { exists: false, isDirectory: false, hasImportDirs: false };
  }
});

ipcMain.handle("cowhub:managed-repo-path", (_event, repoUrl) => {
  const source = String(repoUrl || "").trim();
  if (!source) {
    return "";
  }
  const repoId = buildRepoId(source);
  return path.join(os.homedir(), ".snakehub", "repos", repoId);
});

function stopDesktopServer() {
  if (!serverProcess || serverProcess.killed) {
    return;
  }

  try {
    serverProcess.kill("SIGTERM");
  } catch {
    // ignore
  }
  serverProcess = null;
}

function getDefaultShell() {
  if (process.platform === "win32") {
    return process.env.COMSPEC || "cmd.exe";
  }
  return process.env.SHELL || "/bin/bash";
}

function sendTerminalEvent(ownerWebContentsId, channel, payload) {
  const win = BrowserWindow.getAllWindows().find((item) => item.webContents && item.webContents.id === ownerWebContentsId);
  if (!win || win.isDestroyed()) {
    return;
  }
  win.webContents.send(channel, payload);
}

function stopTerminalProcess() {
  if (!terminalProcess || terminalProcess.killed) {
    terminalProcess = null;
    terminalOwnerWebContentsId = 0;
    return;
  }
  try {
    terminalProcess.kill("SIGTERM");
  } catch {
    // ignore
  }
  terminalProcess = null;
  terminalOwnerWebContentsId = 0;
}

ipcMain.handle("cowhub:terminal-start", (event) => {
  if (terminalProcess && !terminalProcess.killed) {
    return { shell: getDefaultShell(), pid: terminalProcess.pid || 0, reused: true };
  }

  const shellBin = getDefaultShell();
  const child = spawn(shellBin, [], {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: ["pipe", "pipe", "pipe"],
  });

  terminalProcess = child;
  terminalOwnerWebContentsId = event.sender.id;

  child.stdout.on("data", (chunk) => {
    sendTerminalEvent(terminalOwnerWebContentsId, "cowhub:terminal-data", { stream: "stdout", data: chunk.toString() });
  });
  child.stderr.on("data", (chunk) => {
    sendTerminalEvent(terminalOwnerWebContentsId, "cowhub:terminal-data", { stream: "stderr", data: chunk.toString() });
  });
  child.on("exit", (code, signal) => {
    sendTerminalEvent(terminalOwnerWebContentsId, "cowhub:terminal-exit", { code: Number(code || 0), signal: String(signal || "") });
    terminalProcess = null;
    terminalOwnerWebContentsId = 0;
  });

  return { shell: shellBin, pid: child.pid || 0, reused: false };
});

ipcMain.handle("cowhub:terminal-write", (_event, text) => {
  if (!terminalProcess || terminalProcess.killed || !terminalProcess.stdin.writable) {
    throw new Error("Terminal session is not running.");
  }
  terminalProcess.stdin.write(String(text || ""));
  return { ok: true };
});

ipcMain.handle("cowhub:terminal-stop", () => {
  stopTerminalProcess();
  return { ok: true };
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopTerminalProcess();
  stopDesktopServer();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    try {
      await createMainWindow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dialog.showErrorBox("SnakeHub Desktop", `Failed to reopen desktop shell:\n${message}`);
    }
  }
});

app.whenReady()
  .then(async () => {
    try {
      await createMainWindow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dialog.showErrorBox("SnakeHub Desktop", `Failed to start desktop shell:\n${message}`);
      app.quit();
    }
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox("SnakeHub Desktop", `Unexpected startup failure:\n${message}`);
    app.quit();
  });
