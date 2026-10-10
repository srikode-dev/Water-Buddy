import { app, BrowserWindow, ipcMain, screen, Notification } from 'electron';
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

function triggerNotification() {
  const settings = store.get('settings') || {};
  const cup = settings.manualSipMl || 150;
  const iconPath = path.join(__dirname, '../public/icon.png');

  // 1. Native Windows Notification Toast
  if (Notification.isSupported()) {
    try {
      const notif = new Notification({
        title: 'Water Buddy',
        body: `Time to drink water! Have a glass (${cup} ml) to stay hydrated.`,
        icon: iconPath,
        silent: settings.soundOn === false
      });
      notif.on('click', () => {
        if (settingsWindow && !settingsWindow.isDestroyed()) {
          settingsWindow.show();
          settingsWindow.focus();
        }
      });
      notif.show();
    } catch (err) {
      console.error('Notification error:', err);
    }
  }

  // 2. Interactive Desktop HUD Overlay Widget
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    overlayWindow.setAlwaysOnTop(true, 'floating');
    overlayWindow.moveTop();
    overlayWindow.webContents.send('trigger-walk');
  }
}

function createWindows() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  const overlayWidth = 470;
  const overlayHeight = 90;

  // Position at Bottom-Right corner (above the Windows system tray & clock)
  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x: x + width - overlayWidth - 24,
    y: y + height - overlayHeight - 16,
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
    width: 900,
    height: 660,
    minWidth: 780,
    minHeight: 560,
    backgroundColor: '#070F19',
    icon: iconPath,
    title: 'Water Buddy',
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

  ipcMain.on('trigger-test-reminder', () => {
    triggerNotification();
  });

  ipcMain.on('hide-overlay', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.hide();
    }
  });

  ipcMain.handle('get-settings', () => store.get('settings'));
  ipcMain.handle('save-settings', (event, settings) => {
    store.set('settings', settings);
    startScheduler(() => triggerNotification());
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
