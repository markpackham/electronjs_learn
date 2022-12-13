const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");

// electorn has it's own nodemon varient which is run like this:
// npx electronmon .

const isDev = process.env.NODE_ENV !== "production";
// check if Mac is being used
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

// Create the main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1100 : 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Open devtools if in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// Create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About and not Aboot",
    width: 500,
    height: 600,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// App is ready
app.whenReady().then(() => {
  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow.on("closed", () => (mainWindow = null));

  // Open a window if none are open (Mac)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
];

// Respond to ipcRender resize
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

// Resize the image
async function resizeImage({ imgPath, height, width, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // Create file namee
    const filename = "resized-" + path.basename(imgPath);

    // Create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Write file to destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    // Send success to renderer
    mainWindow.webContents.send("image:done");

    // Open destination folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// have app behave the same on Windows and Mac operating systems
// "darwin" for Mac, "win32" for Windows and "linux" for linux
app.on("window-all-close", () => {
  if (!isMac) {
    app.quit();
  }
});
