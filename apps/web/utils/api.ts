/**
 * Centralized API & Environment Configuration for Water Buddy Web
 * Seamlessly switches between local development and Render / Vercel cloud environments.
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://water-buddy-r8ur.onrender.com';

export const GITHUB_REPO = 'srikode-dev/Water-Buddy';

export const DEFAULT_DOWNLOAD_EXE_URL = 
  process.env.NEXT_PUBLIC_DOWNLOAD_URL || 
  `https://github.com/${GITHUB_REPO}/releases/latest/download/WaterBuddy-Setup.exe`;

export const GITHUB_RELEASES_URL = 
  `https://github.com/${GITHUB_REPO}/releases`;

export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
