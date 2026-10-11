const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  logWater: (data) => ipcRenderer.send('log-water', data),
  onTriggerWalk: (callback) => {
    ipcRenderer.removeAllListeners('trigger-walk');
    ipcRenderer.on('trigger-walk', () => callback());
  },
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  onSyncLog: (callback) => {
    ipcRenderer.removeAllListeners('sync-log');
    ipcRenderer.on('sync-log', (event, data) => callback(data));
  },
  setAuthToken: (token) => ipcRenderer.invoke('set-auth-token', token),
  getAuthToken: () => ipcRenderer.invoke('get-auth-token'),
  saveLogs: (logs) => ipcRenderer.invoke('save-logs', logs),
  getGuestLogs: () => ipcRenderer.invoke('get-guest-logs'),
  saveGuestLogs: (logs) => ipcRenderer.invoke('save-guest-logs', logs),
  clearAuth: () => ipcRenderer.invoke('clear-auth'),
  triggerTestReminder: () => ipcRenderer.send('trigger-test-reminder'),
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  syncNow: () => ipcRenderer.invoke('sync-now'),
  getLastSync: () => ipcRenderer.invoke('get-last-sync'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isWindowMaximized: () => ipcRenderer.invoke('window-is-maximized')
});
