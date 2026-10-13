import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { ipcMain, app } from 'electron';

let targetWindows = [];
let updateState = {
  status: 'idle', // 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  currentVersion: app.getVersion(),
  availableVersion: null,
  releaseNotes: null,
  progress: 0,
  error: null
};

function broadcastStatus(statusUpdate) {
  updateState = { ...updateState, ...statusUpdate };
  for (const win of targetWindows) {
    if (win && !win.isDestroyed()) {
      try {
        win.webContents.send('update-status', updateState);
      } catch (e) {
        // window closed
      }
    }
  }
}

export function initAutoUpdater(windows = []) {
  targetWindows = windows.filter(Boolean);

  // Configure autoUpdater
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Don't throw errors in development if no app-update.yml exists
  autoUpdater.logger = {
    info: (msg) => console.log('[AutoUpdater]', msg),
    warn: (msg) => console.warn('[AutoUpdater Warning]', msg),
    error: (msg) => console.error('[AutoUpdater Error]', msg)
  };

  autoUpdater.on('checking-for-update', () => {
    broadcastStatus({ status: 'checking', error: null });
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info.version);
    broadcastStatus({
      status: 'available',
      availableVersion: info.version,
      releaseNotes: info.releaseNotes || 'New features and performance enhancements.',
      error: null
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Update not available. Current version is latest.');
    broadcastStatus({
      status: 'not-available',
      error: null
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent || 0);
    broadcastStatus({
      status: 'downloading',
      progress: percent,
      error: null
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded successfully:', info.version);
    broadcastStatus({
      status: 'downloaded',
      availableVersion: info.version,
      progress: 100,
      error: null
    });
  });

  autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater] Error checking/downloading update:', err?.message || err);
    broadcastStatus({
      status: 'error',
      error: err?.message || 'Failed to check for updates'
    });
  });

  // Setup IPC Handlers
  ipcMain.handle('check-for-updates', async () => {
    try {
      broadcastStatus({ status: 'checking', error: null });
      const result = await autoUpdater.checkForUpdates();
      return { success: true, result };
    } catch (err) {
      console.warn('[AutoUpdater] Manual check error:', err.message);
      broadcastStatus({ status: 'error', error: err.message });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-update-status', () => {
    return updateState;
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.on('restart-and-install-update', () => {
    console.log('[AutoUpdater] Installing update and restarting app...');
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (e) {
      console.error('[AutoUpdater] Failed to quit and install:', e);
    }
  });

  // Check for updates shortly after launch (production only or if network ready)
  if (process.env.NODE_ENV !== 'development') {
    setTimeout(() => {
      try {
        autoUpdater.checkForUpdatesAndNotify().catch((e) => {
          console.warn('[AutoUpdater] Silent background check failed:', e?.message);
        });
      } catch (e) {}
    }, 8000);
  }
}
