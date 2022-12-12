const path = require("path");
const { app, BrowserWindow } = require("electron");
// check if Mac is being used
const isMac = process.platform === "darwin";

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: 500,
    height: 600,
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

app.whenReady().then(() => {
  createMainWindow();
});

// have app behave the same on Windows and Mac operating systems
// "darwin" for Mac, "win32" for Windows and "linux" for linux
app.on("window-all-close", () => {
  if (!isMac) {
    app.quit();
  }
});
