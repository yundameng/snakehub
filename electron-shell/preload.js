const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("cowhubDesktop", {
  pickDirectory: async () => {
    const selected = await ipcRenderer.invoke("cowhub:pick-directory");
    return typeof selected === "string" ? selected : "";
  },
  getPathForFile: (file) => {
    try {
      if (!file) {
        return "";
      }
      return webUtils.getPathForFile(file) || "";
    } catch {
      return "";
    }
  },
  inspectPath: async (targetPath) => {
    const result = await ipcRenderer.invoke("cowhub:path-info", targetPath);
    return result || { exists: false, isDirectory: false, hasImportDirs: false };
  },
  getManagedRepoPath: async (repoUrl) => {
    const result = await ipcRenderer.invoke("cowhub:managed-repo-path", repoUrl);
    return typeof result === "string" ? result : "";
  },
  terminalStart: async () => {
    const result = await ipcRenderer.invoke("cowhub:terminal-start");
    return result || {};
  },
  terminalWrite: async (text) => {
    const result = await ipcRenderer.invoke("cowhub:terminal-write", text);
    return result || {};
  },
  terminalStop: async () => {
    const result = await ipcRenderer.invoke("cowhub:terminal-stop");
    return result || {};
  },
  onTerminalData: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("cowhub:terminal-data", listener);
    return () => {
      ipcRenderer.removeListener("cowhub:terminal-data", listener);
    };
  },
  onTerminalExit: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on("cowhub:terminal-exit", listener);
    return () => {
      ipcRenderer.removeListener("cowhub:terminal-exit", listener);
    };
  },
});
