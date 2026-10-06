import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String }
});
export const User = mongoose.model('User', userSchema);

const widgetSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: '' },
  weight: { type: Number, default: 70 },
  height: { type: Number, default: 170 },
  dailyGoal: { type: Number, default: 2450 },
  intervalMin: { type: Number, default: 45 },
  manualSipMl: { type: Number, default: 150 },
  launchOnStartup: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastGoalMetDate: { type: String },
  badges: [{ type: String }]
});
export const WidgetSettings = mongoose.model('WidgetSettings', widgetSettingsSchema);

const waterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  amountMl: { type: Number },
  response: { type: String, enum: ['yes', 'no', 'ignored'], required: true },
  beverageType: { type: String, default: 'water' },
  hydrationMultiplier: { type: Number, default: 1 },
  source: { type: String, default: 'reminder' }
});
export const WaterLog = mongoose.model('WaterLog', waterLogSchema);
