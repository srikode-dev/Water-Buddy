import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Hydrator' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['Free', 'Pro Lifetime (₹899)'], default: 'Free' },
  onboarding: {
    age: { type: Number, default: 28 },
    gender: { type: String, default: 'Other' },
    weight: { type: Number, default: 70 },
    height: { type: Number, default: 170 },
    medicalInfo: { type: String, default: 'Normal Healthy' },
    dailyGoal: { type: Number, default: 2450 },
    reminderInterval: { type: Number, default: 45 },
    notificationTheme: { type: String, default: 'oceanic' },
    notificationPosition: { type: String, default: 'bottom-right' }
  },
  createdAt: { type: Date, default: Date.now }
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
  badges: [{ type: String }],
  notificationTheme: { type: String, default: 'oceanic' },
  notificationPosition: { type: String, default: 'bottom-right' }
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

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'General Inquiry' },
  message: { type: String, required: true },
  status: { type: String, enum: ['New', 'In Review', 'Resolved'], default: 'New' },
  createdAt: { type: Date, default: Date.now }
});
export const Inquiry = mongoose.model('Inquiry', inquirySchema);
