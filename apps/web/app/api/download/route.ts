import { NextResponse } from 'next/server';
import { DEFAULT_DOWNLOAD_EXE_URL } from '@/utils/api';

export async function GET() {
  // 307 Temporary Redirect to the latest Windows setup .exe on GitHub Releases
  return NextResponse.redirect(DEFAULT_DOWNLOAD_EXE_URL, 307);
}
