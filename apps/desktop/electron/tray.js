import { Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { pauseScheduler } from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let tray = null;

export function createTray(triggerNowCallback, openSettingsCallback, quitCallback) {
  const iconPath = path.join(__dirname, '../public/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  // Resize icon slightly for tray if needed, but Windows scales it down
  tray = new Tray(icon.resize({ width: 24, height: 24 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Trigger Now', click: triggerNowCallback },
    { label: 'Pause for 1 hour', click: () => pauseScheduler(60) },
    { type: 'separator' },
    { label: 'Settings', click: openSettingsCallback },
    { label: 'Quit Water Buddy', click: quitCallback }
  ]);
  
  tray.setToolTip('Water Buddy');
  tray.setContextMenu(contextMenu);
  
  return tray;
}
