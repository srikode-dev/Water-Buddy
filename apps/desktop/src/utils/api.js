// API Configuration for Water Buddy Desktop Client
export const API_BASE_URL =
  (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '') ||
  (typeof window !== 'undefined' && window.localStorage?.getItem('wb_api_url')) ||
  'http://localhost:5000';
