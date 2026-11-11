import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/90 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-xl shadow-amber-500/20 border border-amber-400/40 animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>Offline Mode — Cached data is being used.</span>
    </div>
  );
};
