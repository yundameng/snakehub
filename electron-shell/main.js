const { app, BrowserWindow, dialog, shell, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const fs = require("node:fs");

let mainWindow = null;
let serverProcess = null;
let serverPort = null;

function getNodeBin() {
  return process.execPath;
}

function getRuntimeBaseDir() {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.resolve(__dirname, "..");
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
    width: 1420,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
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
