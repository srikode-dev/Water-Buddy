import jwt from 'jsonwebtoken';
import { User, WaterLog, Inquiry, WidgetSettings, PricingConfig, DEFAULT_FEATURES } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-water-buddy';

export const getAdminStats = async (req, res) => {
  try {
    let pricing = await PricingConfig.findOne();
    const hasValidFeatures = pricing && Array.isArray(pricing.features) && pricing.features.length > 0 && pricing.features.every(f => f.id && f.name);
    if (!pricing || !hasValidFeatures) {
      if (!pricing) {
        pricing = new PricingConfig({ features: DEFAULT_FEATURES, price: 89, billingInterval: 'month' });
      } else {
        pricing.features = DEFAULT_FEATURES;
        if (!pricing.price || pricing.price === 899) pricing.price = 89;
        if (!pricing.billingInterval) pricing.billingInterval = 'month';
      }
      await pricing.save();
    }
    const currentPrice = pricing.price || 89;

    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: { $regex: /Pro/i } });
    const freeUsers = Math.max(0, totalUsers - proUsers);
    const totalRevenue = proUsers * currentPrice;

    const totalLogs = await WaterLog.countDocuments();
    const intakeAgg = await WaterLog.aggregate([
      { $match: { response: 'yes' } },
      { $group: { _id: null, totalMl: { $sum: '$amountMl' } } }
    ]);
    const totalMlDrank = intakeAgg[0]?.totalMl || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeUsersToday = await WaterLog.distinct('userId', {
      timestamp: { $gte: todayStart }
    });

    const totalInquiries = await Inquiry.countDocuments();

    // Compute real hourly distribution for today's aggregate intake curve
    const todayLogs = await WaterLog.find({
      timestamp: { $gte: todayStart },
      response: 'yes'
    });

    const timeSlots = [
      { label: '9:00 AM', hourStart: 8, hourEnd: 10 },
      { label: '10:30 AM', hourStart: 10, hourEnd: 11.5 },
      { label: '12:00 PM', hourStart: 11.5, hourEnd: 13 },
      { label: '1:30 PM', hourStart: 13, hourEnd: 14.5 },
      { label: '3:00 PM', hourStart: 14.5, hourEnd: 16 },
      { label: '4:30 PM', hourStart: 16, hourEnd: 17.5 },
      { label: '6:00 PM', hourStart: 17.5, hourEnd: 24 }
    ];

    const hourlyActivity = timeSlots.map(slot => {
      const volumeInSlot = todayLogs.filter(log => {
        const d = new Date(log.timestamp);
        const h = d.getHours() + d.getMinutes() / 60;
        return h >= slot.hourStart && h < slot.hourEnd;
      }).reduce((sum, log) => sum + (log.amountMl || 0), 0);

      return {
        label: slot.label,
        volume: volumeInSlot
      };
    });

    res.json({
      totalUsers,
      proUsers,
      freeUsers,
      totalRevenue,
      currency: pricing.currency || 'INR',
      currencySymbol: pricing.currencySymbol || '₹',
      totalLogs,
      totalLitersDrank: (totalMlDrank / 1000).toFixed(1),
      activeHydratorsToday: activeUsersToday.length,
      totalInquiries,
      hourlyActivity
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const rawUsers = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100);

    const users = rawUsers.map(u => ({
      ...u.toObject(),
      id: u._id.toString(),
      _id: u._id.toString()
    }));

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminInquiries = async (req, res) => {
  try {
    const rawInquiries = await Inquiry.find().sort({ createdAt: -1 });
    const inquiries = rawInquiries.map(inq => ({
      ...inq.toObject(),
      id: inq._id.toString(),
      _id: inq._id.toString()
    }));
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const inquiry = new Inquiry({
      name,
      email,
      subject: subject || 'General Question',
      message
    });
    await inquiry.save();

    res.status(201).json({
      message: 'Inquiry received. The owner will review it shortly.',
      inquiry: {
        ...inquiry.toObject(),
        id: inquiry._id.toString(),
        _id: inquiry._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPricing = async (req, res) => {
  try {
    let pricing = await PricingConfig.findOne();
    const hasValidFeatures = pricing && Array.isArray(pricing.features) && pricing.features.length > 0 && pricing.features.every(f => f.id && f.name);

    if (!pricing || !hasValidFeatures) {
      if (!pricing) {
        pricing = new PricingConfig({ features: DEFAULT_FEATURES, price: 89, billingInterval: 'month' });
      } else {
        pricing.features = DEFAULT_FEATURES;
        if (!pricing.price || pricing.price === 899) pricing.price = 89;
        if (!pricing.billingInterval) pricing.billingInterval = 'month';
      }
      await pricing.save();
    } else {
      // Auto-merge any new features defined in DEFAULT_FEATURES
      const existingIds = new Set(pricing.features.map(f => f.id));
      let changed = false;
      for (const df of DEFAULT_FEATURES) {
        if (!existingIds.has(df.id)) {
          pricing.features.push(df);
          changed = true;
        }
      }
      if (pricing.price === 899) {
        pricing.price = 89;
        pricing.billingInterval = 'month';
        changed = true;
      }
      if (!pricing.billingInterval) {
        pricing.billingInterval = 'month';
        changed = true;
      }
      if (changed) {
        await pricing.save();
      }
    }
    res.json({ pricing });
  } catch (error) {
    console.error('getPricing error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePricing = async (req, res) => {
  try {
    const { planName, editionName, freePlanName, price, billingInterval, currency, currencySymbol, gstPercent, features } = req.body;
    let pricing = await PricingConfig.findOne();
    if (!pricing) {
      pricing = new PricingConfig();
    }
    if (planName !== undefined) pricing.planName = planName;
    if (editionName !== undefined) pricing.editionName = editionName;
    if (freePlanName !== undefined) pricing.freePlanName = freePlanName;
    if (price !== undefined) pricing.price = Number(price);
    if (billingInterval !== undefined) pricing.billingInterval = billingInterval;
    if (currency !== undefined) pricing.currency = currency;
    if (currencySymbol !== undefined) pricing.currencySymbol = currencySymbol;
    if (gstPercent !== undefined) pricing.gstPercent = Number(gstPercent);
    if (features !== undefined && Array.isArray(features)) {
      pricing.features = features.map(f => ({
        id: f.id || f.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: f.name,
        description: f.description || '',
        includedInFree: Boolean(f.includedInFree),
        includedInPro: Boolean(f.includedInPro),
        category: f.category || 'General'
      }));
    }
    pricing.updatedAt = new Date();

    await pricing.save();
    res.json({ message: 'Pricing and feature entitlements saved successfully', pricing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEntitlements = async (req, res) => {
  try {
    let pricing = await PricingConfig.findOne();
    const hasValidFeatures = pricing && Array.isArray(pricing.features) && pricing.features.length > 0 && pricing.features.every(f => f.id && f.name);
    if (!pricing || !hasValidFeatures) {
      if (!pricing) {
        pricing = new PricingConfig({ features: DEFAULT_FEATURES, price: 89, billingInterval: 'month' });
      } else {
        pricing.features = DEFAULT_FEATURES;
        if (!pricing.price || pricing.price === 899) pricing.price = 89;
        if (!pricing.billingInterval) pricing.billingInterval = 'month';
      }
      await pricing.save();
    }

    let user = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        user = await User.findById(decoded.userId);
      } catch (e) {
        // guest
      }
    }

    const isPro = user ? (user.role === 'admin' || user.plan?.toLowerCase().includes('pro')) : false;
    const allowedFeatureIds = pricing.features
      .filter(f => isPro ? f.includedInPro : f.includedInFree)
      .map(f => f.id);

    res.json({
      plan: user ? user.plan : 'Free',
      isPro,
      role: user ? user.role : 'guest',
      allowedFeatureIds,
      features: pricing.features,
      pricing: {
        price: pricing.price,
        billingInterval: pricing.billingInterval || 'month',
        planName: pricing.planName,
        editionName: pricing.editionName,
        freePlanName: pricing.freePlanName,
        currencySymbol: pricing.currencySymbol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetDefaultFeatures = async (req, res) => {
  try {
    let pricing = await PricingConfig.findOne();
    if (!pricing) {
      pricing = new PricingConfig();
    }
    pricing.features = DEFAULT_FEATURES;
    pricing.updatedAt = new Date();
    await pricing.save();
    res.json({ message: 'Default feature catalog restored successfully', pricing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
