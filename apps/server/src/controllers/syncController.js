import { WidgetSettings, WaterLog } from '../models/index.js';

export const syncData = async (req, res) => {
  try {
    const { settings, logs } = req.body;
    const userId = req.user.userId;

    // 1. Sync Settings (Last-write wins from client for MVP)
    if (settings) {
      await WidgetSettings.findOneAndUpdate(
        { userId },
        { ...settings, userId },
        { upsert: true, new: true }
      );
    }

    // 2. Sync Logs (Deduplicate using logId)
    let syncedCount = 0;
    if (logs && logs.length > 0) {
      for (const log of logs) {
        // Upsert based on logId
        const result = await WaterLog.updateOne(
          { logId: log.id, userId },
          { $set: { 
              timestamp: log.timestamp, 
              amountMl: log.amount, 
              response: log.response, 
              beverageType: log.beverageType || 'water',
              hydrationMultiplier: log.hydrationMultiplier || 1,
              source: log.source || 'reminder'
            } 
          },
          { upsert: true }
        );
        if (result.upsertedCount > 0) syncedCount++;
      }
    }

    // Fetch the latest state to return to client
    const serverSettings = await WidgetSettings.findOne({ userId });
    // Return logs for today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const serverLogs = await WaterLog.find({ userId, timestamp: { $gte: startOfDay } });

    res.json({ 
      message: 'Sync successful', 
      syncedLogsCount: syncedCount,
      settings: serverSettings,
      logs: serverLogs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await WaterLog.find({ userId }).sort({ timestamp: -1 }).limit(100);
    const settings = await WidgetSettings.findOne({ userId });
    res.json({ logs, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
