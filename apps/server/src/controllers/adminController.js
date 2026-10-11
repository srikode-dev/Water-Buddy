import { User, WaterLog, Inquiry, WidgetSettings } from '../models/index.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: 'Pro Lifetime (₹899)' });
    const freeUsers = totalUsers - proUsers;
    const totalRevenue = proUsers * 899;

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

    res.json({
      totalUsers,
      proUsers,
      freeUsers,
      totalRevenue,
      currency: 'INR',
      currencySymbol: '₹',
      totalLogs,
      totalLitersDrank: (totalMlDrank / 1000).toFixed(1),
      activeHydratorsToday: activeUsersToday.length,
      totalInquiries
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdminInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
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

    res.status(201).json({ message: 'Inquiry received. The owner will review it shortly.', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
