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
});
