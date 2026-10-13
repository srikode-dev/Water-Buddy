import { NextResponse } from 'next/server';
import { GITHUB_REPO, LATEST_DESKTOP_VERSION, LATEST_RELEASE_DATE, DEFAULT_DOWNLOAD_EXE_URL } from '@/utils/api';

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'WaterBuddy-Web'
      },
      next: { revalidate: 300 } // cache for 5 minutes
    });

    if (res.ok) {
      const data = await res.json();
      const exeAsset = data.assets?.find((a: any) => a.name.endsWith('.exe'));
      const formattedDate = data.published_at
        ? new Date(data.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : LATEST_RELEASE_DATE;

      return NextResponse.json({
        version: data.tag_name || LATEST_DESKTOP_VERSION,
        publishedAt: formattedDate,
        sizeMb: exeAsset ? `${Math.round(exeAsset.size / (1024 * 1024))} MB` : '112 MB',
        downloadUrl: exeAsset?.browser_download_url || DEFAULT_DOWNLOAD_EXE_URL,
        releaseNotes: data.name || data.tag_name
      });
    }
  } catch (err) {
    console.warn('Failed to fetch latest GitHub release info:', err);
  }

  // Graceful fallback
  return NextResponse.json({
    version: LATEST_DESKTOP_VERSION,
    publishedAt: LATEST_RELEASE_DATE,
    sizeMb: '112 MB',
    downloadUrl: DEFAULT_DOWNLOAD_EXE_URL,
    releaseNotes: 'Production Stable Release'
  });
}
