import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>PWA Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95 disabled:opacity-60"
        title="Install Nexus AI as a Desktop/Mobile App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{installing ? 'Installing...' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit doesn't trigger beforeinstallprompt, needs manual Add to Home Screen)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all active:scale-95"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Add Nexus AI to your home screen</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                  <p>Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3 h-3 text-indigo-400" /> Share</strong> button in Safari's bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                  <p>Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                  <p>Tap <strong className="text-white">Add</strong> in the top-right corner to launch anytime like a native app!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white transition shadow-lg shadow-indigo-600/30"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that support install or when user wants to trigger it
  return (
    <button
      onClick={() => {
        // If not triggered yet, inform user or trigger browser install
        if (typeof window !== 'undefined') {
          alert('To install Nexus AI: Open your browser menu (⋮ or Share) and click "Add to Home Screen" or "Install App".');
        }
      }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/80 transition-all hover:text-white"
      title="Install PWA"
    >
      <Download className="w-3.5 h-3.5 text-indigo-400" />
      <span>Install App</span>
    </button>
  );
};
