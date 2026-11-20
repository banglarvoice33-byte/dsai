"use strict";

const { app, BrowserWindow, shell } = require("electron");

const DSAI_ORIGIN = "https://dsai-one.vercel.app";
const ALLOWED_HOST = new URL(DSAI_ORIGIN).host;

function isAllowed(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.host === ALLOWED_HOST;
  } catch {
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!isAllowed(url)) void shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowed(url)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });
  void win.loadURL(DSAI_ORIGIN);
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.dsai.platform");
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
