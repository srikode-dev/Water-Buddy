import { store } from './store.js';

function getApiUrl() {
  const custom = store.get('apiUrl');
  if (custom) {
    const clean = custom.replace(/\/$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return process.env.API_URL || process.env.VITE_API_URL || 'https://water-buddy-qq34.vercel.app/api';
}

export async function syncData(options = {}) {
  const token = store.get('authToken');
  if (!token) return { success: false, reason: 'unauthenticated' };

  const settings = store.get('settings');
  const logs = store.get('logs') || [];
  const unsyncedLogs = logs.filter(log => !log.synced);

  if (!options.force && unsyncedLogs.length === 0 && !store.get('settingsDirty')) {
    return {
      success: true,
      message: 'Up to date',
      lastSync: store.get('lastSyncTime') || new Date().toISOString(),
      logs
    };
  }

  try {
    const response = await fetch(`${getApiUrl()}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ settings, logs: unsyncedLogs })
    });

    if (response.ok) {
      const data = await response.json();
      const lastSyncTime = new Date().toISOString();
      store.set('lastSyncTime', lastSyncTime);

      // Mark local logs as synced
      const updatedLogs = logs.map(log => ({
        ...log,
        synced: true
      }));

      // Merge server logs cleanly without duplicates
      let mergedLogs = [...updatedLogs];
      if (data.logs && Array.isArray(data.logs)) {
        for (const sLog of data.logs) {
          const sId = sLog.logId || sLog._id?.toString();
          const exists = mergedLogs.some(l => 
            l.id === sId || 
            (Math.abs(new Date(l.timestamp).getTime() - new Date(sLog.timestamp).getTime()) < 2000 && l.amount === sLog.amountMl)
          );
          if (!exists) {
            mergedLogs.push({
              id: sId || Date.now().toString(),
              timestamp: sLog.timestamp,
              amount: sLog.amountMl,
              response: sLog.response,
              beverageType: sLog.beverageType || 'water',
              synced: true
            });
          }
        }
      }

      store.set('logs', mergedLogs);
      store.set('settingsDirty', false);

      return {
        success: true,
        lastSync: lastSyncTime,
        logs: mergedLogs,
        syncedCount: data.syncedLogsCount || 0
      };
    } else {
      let errMsg = response.statusText;
      try {
        const errJson = await response.json();
        if (errJson?.error) errMsg = errJson.error;
      } catch (e) {}
      console.error('Sync failed:', response.status, errMsg);
      return {
        success: false,
        status: response.status,
        reason: (response.status === 401 || response.status === 403) ? 'unauthenticated' : 'error',
        error: errMsg
      };
    }
  } catch (err) {
    console.error('Sync network error:', err);
    return { success: false, status: 0, reason: 'network', error: err.message };
  }
}

export function getLastSyncTime() {
  return store.get('lastSyncTime');
}

export function startSyncService() {
  // Sync every 5 minutes
  setInterval(() => syncData({ force: false }), 5 * 60 * 1000);
  // And sync once on startup after 3 seconds
  setTimeout(() => syncData({ force: false }), 3000);
}

