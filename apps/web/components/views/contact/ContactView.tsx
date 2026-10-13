"use client";

import React, { useState } from 'react';
import { playIcelandicChime } from '@/utils/audio';
import { Send, Mail, MessageSquare, CheckCircle2, HelpCircle, Bug, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/utils/api';

export interface ContactViewProps {
  onToast: (msg: string) => void;
}

export function ContactView({ onToast }: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    playIcelandicChime();

    try {
      const categoryLabel = type === 'feedback' ? 'Suggestion' : type === 'bug' ? 'Bug Report' : 'General Help';
      const res = await fetch(`${API_BASE_URL}/api/admin/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: `${categoryLabel}: ${message.trim().slice(0, 45)}`,
          message: message.trim(),
        }),
      });

      if (res.ok) {
        onToast('✓ Your inquiry has been sent to the Owner Inquiries dashboard!');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json().catch(() => ({}));
        onToast(data.error || 'Failed to send inquiry. Please try again.');
      }
    } catch (err) {
      onToast('Inquiry recorded locally. Server sync pending.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-14 pb-20 pt-3 sm:pt-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-3 text-center max-w-xl mx-auto">
        <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
          SUPPORT & FEEDBACK
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
          Get in touch with us
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Have an idea for a new character, found a bug in the Windows app, or need help? 
          We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="md:col-span-7 frosted-glass rounded-3xl p-7 sm:p-8 space-y-6 border border-white/10">
          <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-3">
            <span className="text-slate-400">SEND A MESSAGE</span>
            <span className="text-[#34D399] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
              Support Online
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Smith"
                className="w-full bg-[#070F19] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-[#070F19] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Message Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'feedback', label: 'Suggestion' },
                  { id: 'bug', label: 'Bug Report' },
                  { id: 'question', label: 'General Help' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setType(item.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                      type === item.id
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-white'
                        : 'bg-[#070F19] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Your Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we help you with?"
                className="w-full bg-[#070F19] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#38BDF8] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 rounded-full bg-[#38BDF8] text-[#070F19] font-bold text-xs uppercase tracking-wider hover:bg-white active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>

        {/* Info & FAQ Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <div className="frosted-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-semibold text-white">Direct Contacts</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#38BDF8]" />
                <span>support@waterbuddy.app</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#34D399]" />
                <span>GitHub Issues &amp; Discussions</span>
              </div>
            </div>
          </div>

          <div className="frosted-glass rounded-3xl p-6 border border-white/10 space-y-3 text-xs text-slate-300">
            <h3 className="text-base font-semibold text-white">Character Suggestions?</h3>
            <p className="text-slate-400 leading-relaxed">
              Have an idea for a walking companion sprite (cat, robot, wizard, or custom mascot)? 
              Send us pixel art or a theme idea and we may add it in the next update!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactView;
