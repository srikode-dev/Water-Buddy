/**
 * Centralized API & Environment Configuration for Water Buddy Web
 * Seamlessly switches between local development and Render / Vercel cloud environments.
 */

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://water-buddy-qq34.vercel.app';

export const GITHUB_REPO = 'srikode-dev/Water-Buddy';

export const LATEST_DESKTOP_VERSION = 'v1.0.6';
export const LATEST_RELEASE_DATE = 'October 14, 2026';

export const DEFAULT_DOWNLOAD_EXE_URL = 
  process.env.NEXT_PUBLIC_DOWNLOAD_URL || 
  `https://github.com/${GITHUB_REPO}/releases/latest/download/WaterBuddy-Setup.exe`;

export const GITHUB_RELEASES_URL = 
  `https://github.com/${GITHUB_REPO}/releases`;

export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
