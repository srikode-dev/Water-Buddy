"use client";

import React, { useState, useEffect } from 'react';
import { playBasaltDrop } from '@/utils/audio';
import { X, Download, ExternalLink, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DEFAULT_DOWNLOAD_EXE_URL, GITHUB_RELEASES_URL, LATEST_DESKTOP_VERSION, LATEST_RELEASE_DATE } from '@/utils/api';

export interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onToast }) => {
  const [releaseInfo, setReleaseInfo] = useState({
    version: LATEST_DESKTOP_VERSION,
    publishedAt: LATEST_RELEASE_DATE,
    sizeMb: '112 MB'
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/release-info')
        .then(res => res.json())
        .then(data => {
          if (data && data.version) {
            setReleaseInfo({
              version: data.version,
              publishedAt: data.publishedAt || LATEST_RELEASE_DATE,
              sizeMb: data.sizeMb || '112 MB'
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadFile = () => {
    playBasaltDrop();
    onToast(`Starting download of Water Buddy ${releaseInfo.version}...`);
    const link = document.createElement('a');
    link.href = '/api/download';
    link.target = '_blank';
    link.download = 'WaterBuddy-Setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0c141f] border border-white/20 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl relative my-8 text-slate-200">
        <button
          onClick={onClose}
          aria-label="Close download modal"
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8] text-[10px] font-mono uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span>Official Desktop Release</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight pt-1">
            Water Buddy for Windows 11 / 10
          </h3>
          <p className="text-xs text-slate-400">
            Atmospheric silent hydration companion with Win32 system tray HUD.
          </p>
        </div>

        {/* Release Metadata Grid */}
        <div className="bg-[#070f19] border border-white/10 rounded-xl p-4 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Latest Version:</span>
            <span className="text-[#38bdf8] font-bold text-sm bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/20">
              {releaseInfo.version}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Last Updated:</span>
            </span>
            <span className="text-slate-200 font-semibold">
              {releaseInfo.publishedAt}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Package Size:</span>
            <span className="text-white">
              {releaseInfo.sizeMb} (.exe NSIS installer)
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>Target OS:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Windows 11 / 10 (64-bit)</span>
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Verification:</span>
            <span className="text-[#34D399] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SHA-256 Verified Binary</span>
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleDownloadFile}
            className="w-full py-3.5 rounded-full bg-[#FFFFFF] text-[#070F19] font-bold text-xs uppercase tracking-wider hover:bg-[#38bdf8] hover:text-[#070F19] active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Water Buddy {releaseInfo.version}</span>
          </button>
          
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 pt-1">
            <span className="text-slate-500">Auto-update enabled</span>
            <a
              href={GITHUB_RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#38BDF8] hover:underline cursor-pointer"
            >
              <span>GitHub Releases ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
