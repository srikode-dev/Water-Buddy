import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, WaterLog, WidgetSettings, Inquiry } from './models/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Wipe existing database collections completely
    console.log('Wiping existing database collections...');
    await User.deleteMany({});
    await WaterLog.deleteMany({});
    await WidgetSettings.deleteMany({});
    await Inquiry.deleteMany({});
    console.log('Cleared all collections.');

    // 2. Hash password 'qwertywsx'
    const passwordHash = await bcrypt.hash('qwertywsx', 10);

    // 3. Create Owner (Admin)
    console.log('Seeding Owner account: Srikant.owner@gmail.com ...');
    const owner = new User({
      email: 'srikant.owner@gmail.com',
      passwordHash,
      name: 'Srikant (Owner)',
      role: 'admin',
      plan: 'Pro Lifetime (₹899)',
      onboarding: {
        weight: 74,
        height: 178,
        dailyGoal: 2800,
        medicalInfo: 'Athletic / Daily Workout',
        reminderInterval: 45,
        notificationTheme: 'oceanic',
        notificationPosition: 'bottom-right'
      }
    });
    await owner.save();

    const ownerWidgetSettings = new WidgetSettings({
      userId: owner._id,
      name: owner.name,
      weight: 74,
      height: 178,
      dailyGoal: 2800,
      intervalMin: 45,
      manualSipMl: 250,
      notificationTheme: 'oceanic',
      notificationPosition: 'bottom-right'
    });
    await ownerWidgetSettings.save();

    // 4. Create User
    console.log('Seeding User account: srikant.user@gmail.com ...');
    const user = new User({
      email: 'srikant.user@gmail.com',
      passwordHash,
      name: 'Srikant (User)',
      role: 'user',
      plan: 'Pro Lifetime (₹899)',
      onboarding: {
        weight: 70,
        height: 172,
        dailyGoal: 2450,
        medicalInfo: 'Normal Healthy',
        reminderInterval: 45,
        notificationTheme: 'oceanic',
        notificationPosition: 'bottom-right'
      }
    });
    await user.save();

    const userWidgetSettings = new WidgetSettings({
      userId: user._id,
      name: user.name,
      weight: 70,
      height: 172,
      dailyGoal: 2450,
      intervalMin: 45,
      manualSipMl: 250,
      notificationTheme: 'oceanic',
      notificationPosition: 'bottom-right'
    });
    await userWidgetSettings.save();

    // 5. Seed WaterLogs for User
    console.log('Seeding real hydration logs for user...');
    const now = new Date();
    const todayLogs = [
      { amount: 250, hoursAgo: 7, beverageType: 'water' },
      { amount: 300, hoursAgo: 5.5, beverageType: 'water' },
      { amount: 250, hoursAgo: 4, beverageType: 'tea' },
      { amount: 500, hoursAgo: 2.5, beverageType: 'water' },
      { amount: 250, hoursAgo: 1, beverageType: 'water' },
      { amount: 300, hoursAgo: 0.2, beverageType: 'water' }
    ];

    for (const item of todayLogs) {
      const logDate = new Date(now.getTime() - item.hoursAgo * 60 * 60 * 1000);
      const log = new WaterLog({
        userId: user._id,
        logId: 'seed_' + Math.random().toString(36).substring(2, 9),
        timestamp: logDate,
        amountMl: item.amount,
        response: 'yes',
        beverageType: item.beverageType,
        hydrationMultiplier: item.beverageType === 'tea' ? 0.8 : 1,
        source: 'quick_sip'
      });
      await log.save();
    }

    // Seed a couple of logs for Owner as well
    const ownerLogs = [
      { amount: 350, hoursAgo: 6, beverageType: 'water' },
      { amount: 500, hoursAgo: 3, beverageType: 'water' },
      { amount: 250, hoursAgo: 0.5, beverageType: 'water' }
    ];
    for (const item of ownerLogs) {
      const logDate = new Date(now.getTime() - item.hoursAgo * 60 * 60 * 1000);
      const log = new WaterLog({
        userId: owner._id,
        logId: 'seed_' + Math.random().toString(36).substring(2, 9),
        timestamp: logDate,
        amountMl: item.amount,
        response: 'yes',
        beverageType: item.beverageType,
        hydrationMultiplier: 1,
        source: 'tray_companion'
      });
      await log.save();
    }

    // 6. Seed Inquiries
    console.log('Seeding support inquiries for owner console...');
    const inquiries = [
      {
        name: 'Vikram Mehta',
        email: 'vikram.mehta@enterprise.in',
        subject: 'Team License Inquiry (50 Windows 11 Seats)',
        message: 'Looking to deploy Water Buddy across our design operations studio on Windows 11 desktop systems.',
        status: 'New',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        name: 'Aisha Khan',
        email: 'aisha.khan@creativestudio.org',
        subject: 'Custom sound notification files for reminder prompts',
        message: 'Can our team customize the chime sounds or load gentle audio prompts for desktop reminders?',
        status: 'Resolved',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        name: 'David Miller',
        email: 'david.m@healthops.com',
        subject: 'Offline sync capability on field laptops',
        message: 'Does Water Buddy track intake completely offline when working in flights without active WiFi?',
        status: 'Resolved',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      }
    ];

    for (const inq of inquiries) {
      const inqDoc = new Inquiry(inq);
      await inqDoc.save();
    }

    console.log('Database successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('1. Owner (Admin): Srikant.owner@gmail.com / qwertywsx');
    console.log('2. User: srikant.user@gmail.com / qwertywsx');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedDatabase();
