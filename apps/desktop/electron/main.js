import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startScheduler } from './scheduler.js';
import { createTray } from './tray.js';
import { store } from './store.js';
import { startSyncService, syncData } from './sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

let settingsWindow;
let overlayWindow;
let tray;

function createWindows() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width: width,
    height: 300,
    x: 0,
    y: height - 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  const iconPath = path.join(__dirname, '../public/icon.png');

  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (isDev) {
    overlayWindow.loadURL('http://localhost:5173/overlay.html');
    settingsWindow.loadURL('http://localhost:5173/settings.html');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/overlay.html'));
    settingsWindow.loadFile(path.join(__dirname, '../dist/settings.html'));
  }
}

app.whenReady().then(() => {
  const settings = store.get('settings') || {};
  if (settings.launchOnStartup) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe')
    });
  }

  createWindows();

  tray = createTray(
    () => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('trigger-walk');
      }
    },
    () => {
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.show();
      }
    },
    () => {
      app.quit();
    }
  );

  startScheduler(() => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('trigger-walk');
    }
  });

  startSyncService();

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setIgnoreMouseEvents(ignore, options);
    }
  });

  ipcMain.handle('get-settings', () => store.get('settings'));
  ipcMain.handle('save-settings', (event, settings) => {
    store.set('settings', settings);
    // Restart scheduler with new interval if changed
    startScheduler(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('trigger-walk');
      }
    });
  });
  ipcMain.handle('get-logs', () => store.get('logs') || []);
  ipcMain.handle('get-auth-token', () => store.get('authToken'));
  ipcMain.handle('set-auth-token', (event, token) => store.set('authToken', token));

  ipcMain.on('log-water', (event, data) => {
    console.log('Water logged:', data);
    const logs = store.get('logs') || [];
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...data,
      synced: false
    };
    store.set('logs', [...logs, newLog]);

    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('sync-log', newLog);
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
