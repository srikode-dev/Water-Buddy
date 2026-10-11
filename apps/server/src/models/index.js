import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Hydrator' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, default: 'Free' },
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

export const DEFAULT_FEATURES = [
  {
    id: "tray_companion",
    name: "Windows 11 Tray Companion HUD",
    description: "Silent taskbar companion with real-time circular progress gauge and intake display.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "biometrics_goal",
    name: "Scientific Biometric Target Calibrator",
    description: "Calculates personalized daily hydration requirements based on mass, height, and activity tier.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "offline_sqlite_vault",
    name: "100% Offline Local SQLite Storage",
    description: "Stores logs and streaks entirely on your local machine with zero external network tracking.",
    includedInFree: true,
    includedInPro: true,
    category: "Privacy & Storage"
  },
  {
    id: "standard_reminder_cycles",
    name: "Standard Periodic Reminder Cycles",
    description: "Flexible desk hydration prompts with standard audio chime tones.",
    includedInFree: true,
    includedInPro: true,
    category: "Core Ergonomics"
  },
  {
    id: "adaptive_sip_pacing",
    name: "Adaptive Dynamic Sip Pacing",
    description: "Dynamically scales suggested intake volumes throughout the day based on remaining goal hours.",
    includedInFree: true,
    includedInPro: true,
    category: "Smart Hydration"
  },
  {
    id: "custom_icelandic_chimes",
    name: "Icelandic Chime Sound Library",
    description: "Gentle acoustic mineral chimes and customizable desktop reminder audio themes.",
    includedInFree: true,
    includedInPro: true,
    category: "Audio & Ambiance"
  },
  {
    id: "quiet_hours_dnd",
    name: "Do Not Disturb & Game Mode Suppressor",
    description: "Automatically silences prompts during focus sessions, calendar meetings, and full-screen games.",
    includedInFree: true,
    includedInPro: true,
    category: "Smart Hydration"
  },
  {
    id: "cloud_multi_device_sync",
    name: "Cross-Device Cloud Synchronization",
    description: "Real-time sync of hydration logs and preferences across multiple laptops and web dashboards.",
    includedInFree: true,
    includedInPro: true,
    category: "Cloud & Sync"
  },
  {
    id: "perpetual_analytics_history",
    name: "Perpetual History & Weekly Analytics",
    description: "Historical water logs with hourly aggregate intake curves and streak milestones.",
    includedInFree: true,
    includedInPro: true,
    category: "Cloud & Sync"
  },
  {
    id: "data_export_csv",
    name: "CSV & JSON Telemetry Data Export",
    description: "Export comprehensive hydration records for spreadsheet analysis and medical records.",
    includedInFree: true,
    includedInPro: true,
    category: "Privacy & Storage"
  },
  {
    id: "whatsapp_bot_reminders",
    name: "WhatsApp Bot Reminders & Chat Intake Logging",
    description: "Personal AI hydration bot sending timely WhatsApp prompts with 1-click message logging.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "health_apps_sync",
    name: "Apple Health & Google Health Connect Sync",
    description: "Automated background sync of water intake telemetry with Apple Health & Google Health Connect.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "exclusive_mobile_app",
    name: "Exclusive Mobile Companion App (iOS & Android)",
    description: "Exclusive access to the upcoming native companion smartphone app with lock-screen widgets.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  },
  {
    id: "priority_cloud_api",
    name: "Priority Cloud Webhooks & Integrations API",
    description: "Developer webhook triggers, custom integration endpoints, and zero-latency priority cloud pipelines.",
    includedInFree: false,
    includedInPro: true,
    category: "Future Cloud Integrations"
  }
];

const featureItemSchema = new mongoose.Schema({
  id: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  includedInFree: { type: Boolean, default: false },
  includedInPro: { type: Boolean, default: true },
  category: { type: String, default: 'Core Ergonomics' }
}, { _id: false });

const pricingConfigSchema = new mongoose.Schema({
  planName: { type: String, default: 'Pro Supporter Plan' },
  editionName: { type: String, default: 'WhatsApp & Cloud Edition' },
  freePlanName: { type: String, default: 'Community Edition (All Desktop Features)' },
  price: { type: Number, default: 89 },
  billingInterval: { type: String, default: 'month' },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  gstPercent: { type: Number, default: 18 },
  features: {
    type: [featureItemSchema],
    default: () => DEFAULT_FEATURES
  },
  updatedAt: { type: Date, default: Date.now }
});
export const PricingConfig = mongoose.model('PricingConfig', pricingConfigSchema);
