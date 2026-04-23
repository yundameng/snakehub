const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cowhubDesktop", {
  pickDirectory: async () => {
    const selected = await ipcRenderer.invoke("cowhub:pick-directory");
    return typeof selected === "string" ? selected : "";
  },
});
