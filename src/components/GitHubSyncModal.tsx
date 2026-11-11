import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  Lock, 
  Globe, 
  Key, 
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'integrations' | 'settings'>('github');
  const [token, setToken] = useState('');
  const [repoName, setRepoName] = useState('nexus-ai-workspace');
  const [commitMessage, setCommitMessage] = useState('feat: initial sync from Nexus AI');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncedUrl, setSyncedUrl] = useState<string | null>(null);
  const [serverUser, setServerUser] = useState<{ user: string; name: string; avatar: string } | null>(null);

  // Check if token exists in server env on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/github/status')
        .then(res => res.json())
        .then(data => {
          if (data.configured) {
            setServerUser({ user: data.user, name: data.name, avatar: data.avatar });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!token && !serverUser) {
      setErrorMessage('Please enter a GitHub Personal Access Token.');
      return;
    }
    if (!repoName.trim()) {
      setErrorMessage('Repository name cannot be empty.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Authenticating with GitHub and preparing repository...');

    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim() || undefined,
          repoName: repoName.trim(),
          isPrivate,
          commitMessage: commitMessage.trim() || 'Sync from Nexus AI'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync to GitHub.');
      }

      setSyncedUrl(data.repoUrl);
      setStatusMessage('Sync complete! Code has been pushed to GitHub.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while syncing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0d1117] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200"
        >
          {/* Top Nav Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">‹</span>
              <button 
                onClick={() => setActiveTab('github')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'github' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                GitHub
              </button>
              <button 
                onClick={() => setActiveTab('integrations')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'integrations' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Integrations
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Settings
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader */}
          <div className="px-7 pt-5 pb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">GitHub sync</span>
          </div>

          {/* Main Card Content */}
          <div className="p-7 pt-1 overflow-y-auto max-h-[75vh] space-y-6">
            <h2 className="text-2xl font-bold text-center tracking-tight text-white">
              Sync to GitHub
            </h2>

            {/* Glowing Centerpiece Halo Icon */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-500 to-cyan-400 opacity-60 blur-xl animate-pulse pointer-events-none"></div>
              
              <div className="relative w-36 h-36 rounded-full p-[3px] bg-gradient-to-tr from-orange-400 via-indigo-600 to-sky-400 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                  <svg className="w-20 h-20 fill-white drop-shadow-md" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.36 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Feature Bullet Points matching AI Studio UI */}
            <div className="space-y-3.5 px-3">
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A new GitHub repository will be created and populated with your code.
                </p>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Changes from Nexus AI will be synced directly to GitHub, preserving commits.
                </p>
              </div>
            </div>

            {/* Authenticated user indicator or Token input */}
            <div className="space-y-4 pt-2">
              {serverUser ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={serverUser.avatar} alt={serverUser.user} className="w-7 h-7 rounded-full border border-indigo-400/40" />
                    <div>
                      <span className="font-semibold text-white">{serverUser.name}</span>
                      <span className="text-slate-400 block text-[11px]">@{serverUser.user}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                    Connected
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      GitHub Personal Access Token (PAT)
                    </label>
                    <a 
                      href="https://github.com/settings/tokens/new?scopes=repo" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-2"
                    >
                      Generate Token <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <p className="text-[10px] text-slate-500">Requires <code className="text-slate-400">repo</code> scope to create & push repositories.</p>
                </div>
              )}

              {/* Repo Name & Options */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-cool-project"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Commit Message
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Initial commit"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={isPrivate} 
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0" 
                    />
                    <span className="flex items-center gap-1">
                      {isPrivate ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-slate-400" />}
                      Private repository
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {loading && statusMessage && (
              <div className="px-3 py-2 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-center">
                <p className="text-xs text-indigo-300 animate-pulse">{statusMessage}</p>
              </div>
            )}

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {syncedUrl && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Repository Successfully Synced!</span>
                </div>
                <a 
                  href={syncedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs text-white font-medium bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition"
                >
                  <span>Open on GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Action Button matching screenshot style */}
            <div className="pt-2">
              <button
                onClick={handleSync}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg flex items-center justify-center gap-2 border border-slate-700/60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Syncing Code to GitHub...</span>
                  </>
                ) : (
                  <>
                    <span>Create new repository & Sync</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
