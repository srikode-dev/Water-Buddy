// API Configuration for Water Buddy Desktop Client
export const API_BASE_URL =
  (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '') ||
  (typeof window !== 'undefined' && window.localStorage?.getItem('wb_api_url')) ||
  'https://water-buddy-r8ur.onrender.com';

export const WEB_PORTAL_URL =
  (import.meta.env?.VITE_WEB_PORTAL_URL || '').replace(/\/$/, '') ||
  'https://water-buddy-blush.vercel.app';

