"use client";

import React, { useState } from 'react';
import { playBasaltDrop, playIcelandicChime } from '@/utils/audio';
import { Send, Radio, Mail, MapPin, MessageSquare, Terminal } from 'lucide-react';

interface ContactViewProps {
  onToast: (msg: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onToast }) => {
  const [identity, setIdentity] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransmitting(true);
    playIcelandicChime();

    setTimeout(() => {
      setIsTransmitting(false);
      onToast('Dispatch encrypted and transmitted via 104.2 MHz buffer.');
      setIdentity('');
      setEmail('');
      setMessage('');
    }, 900);
  };

  return (
    <div className="space-y-16 pb-20 pt-4 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="space-y-4">
        <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-[0.22em] font-medium">
          04 —— COMMUNION & INQUIRY
        </span>
        <h1 className="text-3xl sm:text-5xl font-normal text-white tracking-tight">
          Speak with the makers of silence.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base font-light max-w-xl leading-relaxed">
          Direct frequency for studio inquiries, Windows tray telemetry feedback, and bespoke spatial installations.
        </p>
      </div>

      {/* 2. Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7 bg-[#0c141f] border border-white/10 rounded-2xl p-7 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-3">
            <span className="text-slate-400">SECURE TELEMETRY BUFFER // 2025</span>
            <span className="text-[#38bdf8] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
              FREQ 104.2 MHZ
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Your Identity / Studio Desk
              </label>
              <input
                type="text"
                required
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="e.g. Aris Thorne • Studio Maelstrom"
                className="w-full px-4 py-3 rounded-xl bg-[#070f19] border border-white/10 text-white text-xs focus:border-[#38bdf8] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Return Frequency (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.or.workspace"
                className="w-full px-4 py-3 rounded-xl bg-[#070f19] border border-white/10 text-white text-xs focus:border-[#38bdf8] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Dispatch Message
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Transcribe your note with clinical precision..."
                className="w-full px-4 py-3 rounded-xl bg-[#070f19] border border-white/10 text-white text-xs focus:border-[#38bdf8] focus:outline-none transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isTransmitting}
              className="w-full py-3.5 rounded-xl bg-[#38bdf8] text-[#070f19] font-bold text-xs uppercase tracking-wider hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#38bdf8]/20 disabled:opacity-50"
            >
              {isTransmitting ? (
                <>
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>Encrypting & Transmitting...</span>
                </>
              ) : (
                <>
                  <span>Transmit Dispatch ↗</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Info Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-medium">
              Direct Transmissions
            </span>
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">
                  STUDIO DISPATCH ADDRESS:
                </span>
                <p className="text-white font-mono font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>dispatch@waterbuddy.app</span>
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">
                  BENGALURU DESK (IND TELEMETRY & GST):
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Lavelle Road, Shanthala Nagar, Bengaluru, KA 560001
                  <span className="block text-slate-400 font-mono text-[11px] mt-1">
                    GSTIN: 29AABCB1234F1Z8
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0c141f] border border-white/10 rounded-2xl p-6 space-y-3 shadow-xl">
            <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-medium">
              Live Channels
            </span>
            <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
              <span className="text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Discord Quiet Desk Community</span>
              </span>
              <span className="font-mono text-emerald-400 font-medium">4,200 Online</span>
            </div>
            <div className="flex justify-between items-center text-xs py-2">
              <span className="text-slate-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Windows Win32 Issue Tracker</span>
              </span>
              <span className="font-mono text-slate-400">GitHub Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
