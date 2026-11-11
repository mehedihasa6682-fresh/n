import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Github, 
  Flame, 
  ShieldCheck, 
  Sliders, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Gauge, 
  RotateCw,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLocalKeys, getSettings, saveSettings } from '../lib/secretsManager';
import { SettingsConfig, ProviderType } from '../types/secrets';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSecrets: () => void;
  onOpenGitHub: () => void;
  onOpenFirebase: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenSecrets,
  onOpenGitHub,
  onOpenFirebase,
}) => {
  const [settings, setSettingsState] = useState<SettingsConfig>(getSettings());
  const [keysCount, setKeysCount] = useState(0);
  const [activeKeysCount, setActiveKeysCount] = useState(0);
  const [providerSummary, setProviderSummary] = useState<string[]>([]);
  const [gitStatus, setGitStatus] = useState<string>('Unconnected');

  useEffect(() => {
    if (isOpen) {
      setSettingsState(getSettings());
      const keys = getLocalKeys();
      setKeysCount(keys.length);
      setActiveKeysCount(keys.filter(k => k.isActive).length);
      const provs = Array.from(new Set(keys.filter(k => k.isActive).map(k => k.provider)));
      setProviderSummary(provs);

      // Check GitHub status
      fetch('/api/github/status')
        .then(res => res.json())
        .then(data => {
          if (data.configured) setGitStatus(`Connected (@${data.user})`);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdatePreference = (pref: 'all' | ProviderType) => {
    const updated = { ...settings, preferredProvider: pref };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const handleTogglePacing = () => {
    const updated = { ...settings, safePacing: !settings.safePacing };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const handleToggleFailover = () => {
    const updated = { ...settings, autoFailover: !settings.autoFailover };
    setSettingsState(updated);
    saveSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                সেটিংস (Settings)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase tracking-wider">
                  Nexus Control
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                এপিআই সিক্রেটস, গিটহাব রিপোজিটরি সিঙ্ক এবং ফ্রি কোটা রোটেশন কনফিগারেশন।
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Primary Quick Actions Section: Secrets & GitHub */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
              মূল ইন্টিগ্রেশন ও সিক্রেটস
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Secrets Button Card */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSecrets();
                }}
                className="p-4 bg-slate-950/80 hover:bg-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl text-left transition-all group flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10"
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Key className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {activeKeysCount} Active Keys
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    <span>API Secrets (সিক্রেট)</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    ওপেন রাউটার, গ্রোক এবং গুগল এআই স্টুডিও এর আনলিমিটেড ফ্রি কী যুক্ত ও ম্যানেজ করুন।
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>স্মার্ট কোটা প্রটেকশন & রোটেশন সক্রিয়</span>
                </div>
              </button>

              {/* 2. GitHub Sync Button Card */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGitHub();
                }}
                className="p-4 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <Github className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {gitStatus}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    <span>GitHub Sync (গিটহাব)</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    আপনার সম্পূর্ণ প্রজেক্ট রিপোজিটরি সরাসরি গিটহাবে পুশ ও সিঙ্ক করুন।
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>ওয়ান-ক্লিক অটো কমিট ও পুশ</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Firebase Link */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-600/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 block">Firebase Cloud Suite</span>
                <span className="text-[11px] text-slate-400">ফায়ারস্টোর ডাটাবেস ও ইউজার অথেন্টিকেশন সেটিংস</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenFirebase();
              }}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all"
            >
              ওপেন ফায়ারবেস
            </button>
          </div>

          {/* Quota & Failover Engine Settings */}
          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  ফ্রি এপিআই কোটা ও মিনিট লিমিট কন্ট্রোল
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                স্মার্ট সুরক্ষা সক্রিয়
              </span>
            </div>

            {/* Provider Preference */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 block flex items-center justify-between">
                <span>পছন্দের প্রোভাইডার নির্বাচন:</span>
                <span className="text-[10px] text-slate-400">লিমটি শেষ হলে ব্যাকআপ চালু হবে</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: '🔄 অটো ব্যালান্স', desc: 'সবগুলোতে ভাগ করে চালাবে' },
                  { id: 'openrouter', label: '🌐 OpenRouter', desc: 'ফ্রি LLaMA, DeepSeek' },
                  { id: 'gemini', label: '✨ Google AI Studio', desc: 'Gemini 3.8 Flash' },
                  { id: 'grok', label: '⚡ Grok (xAI)', desc: 'Grok 2 Intelligence' },
                ].map((item) => {
                  const isSelected = settings.preferredProvider === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdatePreference(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">স্বয়ংক্রিয় ফেইলওভার (Auto-Failover)</div>
                  <div className="text-[11px] text-slate-400">
                    একটি API কি-তে রেট লিমিট বা এরর আসলে স্বয়ংক্রিয়ভাবে পরবর্তী কি দিয়ে কাজ চালিয়ে যাবে।
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleFailover}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.autoFailover ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">স্মার্ট পেসিং প্রটেকশন (Safe Pacing)</div>
                  <div className="text-[11px] text-slate-400">
                    মিনিটের লিমিট যাতে শেষ না হয় সেজন্য ৬০-সেকেন্ডের উইন্ডোতে রিকোয়েস্ট পর্যবেক্ষণ করে ও সেভ রাখে।
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePacing}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.safePacing ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>সেটিংস পরিবর্তন স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};
