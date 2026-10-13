import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { pauseScheduler } from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let tray = null;

function getTrayIcon() {
  const candidates = [
    path.join(__dirname, 'icon.ico'),
    path.join(__dirname, 'icon.png'),
    path.join(app.getAppPath(), 'electron/icon.ico'),
    path.join(app.getAppPath(), 'electron/icon.png'),
    path.join(__dirname, '../public/icon.ico'),
    path.join(__dirname, '../public/icon.png'),
    path.join(app.getAppPath(), 'public/icon.ico'),
    path.join(app.getAppPath(), 'public/icon.png'),
    path.join(__dirname, '../dist/icon.ico'),
    path.join(__dirname, '../dist/icon.png')
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        if (candidate.endsWith('.ico')) {
          return candidate;
        }
        const img = nativeImage.createFromPath(candidate);
        if (!img.isEmpty()) {
          return img.resize({ width: 24, height: 24, quality: 'best' });
        }
      }
    } catch (e) {}
  }
  return nativeImage.createEmpty();
}

export function createTray(triggerNowCallback, openSettingsCallback, quitCallback) {
  const icon = getTrayIcon();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '💧 Water Buddy', enabled: false },
    { type: 'separator' },
    { label: 'Trigger Reminder Now', click: triggerNowCallback },
    { label: 'Pause for 1 hour', click: () => pauseScheduler(60) },
    { type: 'separator' },
    { label: 'Open Settings HUD', click: openSettingsCallback },
    { label: 'Quit Water Buddy', click: quitCallback }
  ]);
  
  tray.setToolTip('Water Buddy — Atmospheric Hydration');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    openSettingsCallback();
  });
  
  return tray;
}

