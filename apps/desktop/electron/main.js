import { app, BrowserWindow, ipcMain, screen, Notification, shell, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startScheduler } from './scheduler.js';
import { createTray } from './tray.js';
import { store } from './store.js';
import { startSyncService, syncData } from './sync.js';
import { initAutoUpdater } from './updater.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

let settingsWindow;
let overlayWindow;
let tray;

function getOverlayPosition(pos = 'bottom-right') {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  const overlayWidth = 470;
  const overlayHeight = 90;

  let posX = x + width - overlayWidth - 24;
  let posY = y + height - overlayHeight - 16;

  if (pos === 'bottom-left') {
    posX = x + 24;
    posY = y + height - overlayHeight - 16;
  } else if (pos === 'top-right') {
    posX = x + width - overlayWidth - 24;
    posY = y + 24;
  } else if (pos === 'bottom-center') {
    posX = Math.round(x + (width - overlayWidth) / 2);
    posY = y + height - overlayHeight - 20;
  }

  return { posX, posY, overlayWidth, overlayHeight };
}

function triggerNotification() {
  const settings = store.get('settings') || {};

  // Interactive Desktop HUD Overlay Widget (Custom Water Buddy Widget Only)
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    const { posX, posY, overlayWidth, overlayHeight } = getOverlayPosition(settings.notificationPosition);
    overlayWindow.setBounds({ x: posX, y: posY, width: overlayWidth, height: overlayHeight });
    overlayWindow.show();
    overlayWindow.setAlwaysOnTop(true, 'floating');
    overlayWindow.moveTop();
    overlayWindow.webContents.send('trigger-walk');
  }
}

function createWindows() {
  // Completely remove native Windows application menu bar (File Edit View Window)
  Menu.setApplicationMenu(null);

  const settings = store.get('settings') || {};
  const { posX, posY, overlayWidth, overlayHeight } = getOverlayPosition(settings.notificationPosition);

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x: posX,
    y: posY,
    transparent: true,
    frame: false,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  overlayWindow.setAlwaysOnTop(true, 'floating');

  const iconPath = path.join(__dirname, '../public/icon.png');

  settingsWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 840,
    minHeight: 600,
    frame: false, // Custom frameless window — removes the default Windows OS title bar!
    backgroundColor: '#070F19',
    icon: iconPath,
    title: 'Water Buddy',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.removeMenu();

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
    () => triggerNotification(),
    () => {
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.show();
        settingsWindow.focus();
      }
    },
    () => {
      app.quit();
    }
  );

  startScheduler(() => triggerNotification());

  startSyncService();

  initAutoUpdater([settingsWindow, overlayWindow]);

  ipcMain.on('trigger-test-reminder', () => {
    triggerNotification();
  });

  ipcMain.on('hide-overlay', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.hide();
    }
  });

  ipcMain.on('open-external', (event, url) => {
    if (url) {
      shell.openExternal(url);
    }
  });

  // Custom Frameless Window Controls
  ipcMain.on('window-minimize', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.minimize();
    }
  });

  ipcMain.on('window-maximize', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      if (settingsWindow.isMaximized()) {
        settingsWindow.unmaximize();
      } else {
        settingsWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.hide();
    }
  });

  ipcMain.handle('window-is-maximized', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      return settingsWindow.isMaximized();
    }
    return false;
  });

  ipcMain.handle('get-settings', () => store.get('settings'));
  ipcMain.handle('save-settings', (event, newSettings) => {
    store.set('settings', newSettings);
    // If notification position changed, update overlay window bounds
    if (overlayWindow && !overlayWindow.isDestroyed() && newSettings.notificationPosition) {
      const { posX, posY, overlayWidth, overlayHeight } = getOverlayPosition(newSettings.notificationPosition);
      overlayWindow.setBounds({ x: posX, y: posY, width: overlayWidth, height: overlayHeight });
    }
    startScheduler(() => triggerNotification());
  });

  ipcMain.handle('get-logs', () => store.get('logs') || []);
  ipcMain.handle('save-logs', (event, logs) => store.set('logs', logs));
  ipcMain.handle('get-guest-logs', () => store.get('guest_logs') || []);
  ipcMain.handle('save-guest-logs', (event, logs) => store.set('guest_logs', logs));
  ipcMain.handle('get-auth-token', () => store.get('authToken'));
  ipcMain.handle('set-auth-token', (event, token) => store.set('authToken', token));
  ipcMain.handle('clear-auth', () => store.set('authToken', null));
  ipcMain.handle('sync-now', async () => syncData({ force: true }));
  ipcMain.handle('get-last-sync', () => store.get('lastSyncTime'));

  ipcMain.on('log-water', (event, data) => {
    const logs = store.get('logs') || [];
    const now = Date.now();

    // Deduplication check: if an entry with identical ID or recent timestamp (< 1.5s) exists
    if (data.id && logs.some(l => l.id === data.id)) {
      return;
    }
    const isRecentDuplicate = logs.some(l => 
      Math.abs(now - new Date(l.timestamp).getTime()) < 1500 &&
      l.amount === data.amount &&
      l.beverageType === data.beverageType
    );
    if (isRecentDuplicate) {
      return;
    }

    const newLog = {
      id: data.id || now.toString(),
      timestamp: data.timestamp || new Date().toISOString(),
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
