const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Detect dev mode
const isDev = process.env.ELECTRON_START_URL || process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    show: false,
  });

  // Media permission handler: auto-allow camera for our app
  try {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') {
        return callback(true);
      }
      callback(false);
    });
  } catch {}

  win.once('ready-to-show', () => win.show());

  const startUrl = process.env.ELECTRON_START_URL || (isDev ? 'http://localhost:4200' : null);
  if (startUrl) {
    win.loadURL(startUrl);
  } else {
    // Load built Angular app
    const indexPath = path.join(__dirname, '..', 'dist', 'Proyecto-Certificaciones', 'index.html');
    win.loadFile(indexPath);
  }

  // Optional: open devtools in dev
  if (isDev) win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
