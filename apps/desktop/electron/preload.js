const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  logWater: (data) => ipcRenderer.send('log-water', data),
  onTriggerWalk: (callback) => {
    ipcRenderer.on('trigger-walk', () => callback());
  },
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getLogs: () => ipcRenderer.invoke('get-logs'),
  onSyncLog: (callback) => {
    ipcRenderer.on('sync-log', (event, data) => callback(data));
  },
  setAuthToken: (token) => ipcRenderer.invoke('set-auth-token', token),
  getAuthToken: () => ipcRenderer.invoke('get-auth-token')
});
