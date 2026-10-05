import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const widgetSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  characterId: { type: String, default: 'default' },
  intervalMin: { type: Number, default: 45 },
  sipMode: { type: String, default: 'auto' },
  manualSipMl: { type: Number, default: 250 },
  soundOn: { type: Boolean, default: false },
  launchOnStartup: { type: Boolean, default: true }
});

const waterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  logId: { type: String, required: true, unique: true }, // Client-generated ID for deduping
  timestamp: { type: Date, required: true },
  amountMl: { type: Number, default: 0 },
  response: { type: String, enum: ['yes', 'no', 'ignored'], required: true },
  source: { type: String, default: 'reminder' }
});

export const User = mongoose.model('User', userSchema);
export const WidgetSettings = mongoose.model('WidgetSettings', widgetSettingsSchema);
export const WaterLog = mongoose.model('WaterLog', waterLogSchema);
