import { User, PricingConfig, DEFAULT_FEATURES } from '../models/index.js';

/**
 * Returns the effective feature catalog from DB or defaults
 */
export async function getActivePricingConfig() {
  let pricing = await PricingConfig.findOne();
  if (!pricing || !Array.isArray(pricing.features) || pricing.features.length === 0 || typeof pricing.features[0] === 'string') {
    if (!pricing) {
      pricing = new PricingConfig({ features: DEFAULT_FEATURES });
    } else {
      pricing.features = DEFAULT_FEATURES;
    }
    await pricing.save();
  }
  return pricing;
}

/**
 * Check if a specific featureId is enabled for a given userId
 */
export async function isFeatureAllowedForUser(userId, featureId) {
  try {
    const user = await User.findById(userId);
    if (!user) return false;
    // Admins always have access to all features
    if (user.role === 'admin') return true;

    const pricing = await getActivePricingConfig();
    const feature = pricing.features.find(f => f.id === featureId);
    if (!feature) {
      // If the feature is unknown, default to false for safety
      return false;
    }

    const isPro = Boolean(user.plan && user.plan.toLowerCase().includes('pro'));
    return isPro ? Boolean(feature.includedInPro) : Boolean(feature.includedInFree);
  } catch (err) {
    console.error('Error checking feature allowance:', err);
    return false;
  }
}

/**
 * Get array of allowed feature IDs for a user object
 */
export async function getUserAllowedFeatures(user) {
  try {
    if (!user) return [];
    const pricing = await getActivePricingConfig();
    const isPro = user.role === 'admin' || Boolean(user.plan && user.plan.toLowerCase().includes('pro'));

    return pricing.features
      .filter(f => (isPro ? f.includedInPro : f.includedInFree))
      .map(f => f.id);
  } catch (err) {
    console.error('Error fetching allowed features:', err);
    return [];
  }
}
