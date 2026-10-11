import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, WidgetSettings } from '../models/index.js';
import { getUserAllowedFeatures } from '../utils/entitlements.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-water-buddy';

export const registerUser = async (req, res) => {
  try {
    const { email, password, name, plan, onboarding } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    // Auto-make first account or admin@waterbuddy.com an admin
    const isOwner = email.toLowerCase() === 'admin@waterbuddy.com' || email.toLowerCase().includes('admin');
    
    const user = new User({
      email,
      passwordHash,
      name: name || 'Hydrator',
      role: isOwner ? 'admin' : 'user',
      plan: plan || 'Free',
      onboarding: onboarding || {
        weight: 70,
        height: 170,
        dailyGoal: 2450,
        medicalInfo: 'Normal Healthy',
        notificationTheme: 'oceanic',
        notificationPosition: 'bottom-right'
      }
    });
    await user.save();

    // Create matching widget settings for cloud sync
    const widgetSettings = new WidgetSettings({
      userId: user._id,
      name: user.name,
      weight: user.onboarding?.weight || 70,
      height: user.onboarding?.height || 170,
      dailyGoal: user.onboarding?.dailyGoal || 2450,
      intervalMin: user.onboarding?.reminderInterval || 45,
      notificationTheme: user.onboarding?.notificationTheme || 'oceanic',
      notificationPosition: user.onboarding?.notificationPosition || 'bottom-right'
    });
    await widgetSettings.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const allowedFeatures = await getUserAllowedFeatures(user);
    const isPro = user.role === 'admin' || Boolean(user.plan && user.plan.toLowerCase().includes('pro'));

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isPro,
        allowedFeatures,
        onboarding: user.onboarding
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const allowedFeatures = await getUserAllowedFeatures(user);
    const isPro = user.role === 'admin' || Boolean(user.plan && user.plan.toLowerCase().includes('pro'));

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isPro,
        allowedFeatures,
        onboarding: user.onboarding,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allowedFeatures = await getUserAllowedFeatures(user);
    const isPro = user.role === 'admin' || Boolean(user.plan && user.plan.toLowerCase().includes('pro'));

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isPro,
        allowedFeatures,
        onboarding: user.onboarding,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, plan, onboarding } = req.body;

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (plan) user.plan = plan;
    if (onboarding) user.onboarding = { ...user.onboarding, ...onboarding };

    await user.save();
    const allowedFeatures = await getUserAllowedFeatures(user);
    const isPro = user.role === 'admin' || Boolean(user.plan && user.plan.toLowerCase().includes('pro'));

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        isPro,
        allowedFeatures,
        onboarding: user.onboarding,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
