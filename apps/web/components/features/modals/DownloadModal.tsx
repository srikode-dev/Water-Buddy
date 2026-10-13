"use client";

import React from 'react';
import { playBasaltDrop } from '@/utils/audio';
import { X, Download, ExternalLink } from 'lucide-react';
import { DEFAULT_DOWNLOAD_EXE_URL, GITHUB_RELEASES_URL } from '@/utils/api';

export interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onToast }) => {
  if (!isOpen) return null;

  const handleDownloadFile = () => {
    playBasaltDrop();
    onToast('Starting download from production release channel...');
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
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
            WIN32 DIRECT INSTALLER
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Water Buddy for Windows 10 / 11
          </h3>
          <p className="text-xs text-slate-400">
            Lightweight standalone background utility with silent tray HUD companion.
          </p>
        </div>

        <div className="bg-[#070f19] border border-white/5 rounded-xl p-4 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Release Channel:</span>
            <span className="text-[#38bdf8] font-semibold">GitHub Production CDN</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Target OS:</span>
            <span className="text-white">Windows 10 / 11 (x64)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Package Format:</span>
            <span className="text-white">NSIS Executable (.exe)</span>
          </div>
          <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <span>Public Endpoint:</span>
            <div className="text-[10px] text-[#38bdf8] truncate mt-0.5">
              github.com/srikode-dev/Water-Buddy/releases
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleDownloadFile}
            className="w-full py-3.5 rounded-xl bg-[#38bdf8] text-[#070f19] font-bold text-xs uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-lg shadow-[#38bdf8]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .exe Installer</span>
          </button>
          <a
            href={GITHUB_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-[#38BDF8] transition-colors pt-1 cursor-pointer"
          >
            <span>View all releases & checksums on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
