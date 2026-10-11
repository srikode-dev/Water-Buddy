import { net } from 'electron';
import { store } from './store.js';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

export async function syncData() {
  const token = store.get('authToken');
  if (!token) return; // User not logged in

  const settings = store.get('settings');
  const logs = store.get('logs') || [];
  const unsyncedLogs = logs.filter(log => !log.synced);

  if (unsyncedLogs.length === 0 && !store.get('settingsDirty')) {
    return; // Nothing to sync
  }

  try {
    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ settings, logs: unsyncedLogs })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Mark synced
      const updatedLogs = logs.map(log => ({
        ...log,
        synced: true
      }));
      store.set('logs', updatedLogs);
      store.set('settingsDirty', false);

      // Override local settings if server had newer (simplified for MVP)
      if (data.settings) {
        // store.set('settings', data.settings);
      }
    } else {
      console.error('Sync failed:', response.statusText);
    }
  } catch (err) {
    console.error('Sync network error:', err);
  }
}

export function startSyncService() {
  // Sync every 5 minutes
  setInterval(syncData, 5 * 60 * 1000);
  // And sync once on startup
  setTimeout(syncData, 5000);
}
