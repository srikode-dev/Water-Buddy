import { WidgetSettings, WaterLog } from '../models/index.js';

export const syncData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { settings, logs } = req.body;

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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
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
    const logs = await WaterLog.find({ userId }).sort({ timestamp: -1 }).limit(500);
    const settings = await WidgetSettings.findOne({ userId });

    res.json({
      logs,
      settings,
      hasPerpetualHistory: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const exportUserLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const logs = await WaterLog.find({ userId }).sort({ timestamp: -1 });
    const csvHeader = 'Log ID,Timestamp,Amount (ml),Response,Beverage,Multiplier\n';
    const csvRows = logs.map(l => 
      `"${l.logId || l._id}","${l.timestamp?.toISOString()}","${l.amountMl || 0}","${l.response}","${l.beverageType || 'water'}","${l.hydrationMultiplier || 1}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="water-buddy-logs.csv"');
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
