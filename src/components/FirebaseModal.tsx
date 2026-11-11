import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  ShieldCheck, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Code, 
  Copy, 
  Check, 
  FileText,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'rules' | 'auth' | 'code'>('setup');
  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [appId, setAppId] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; config: any; hasRules: boolean; hasSdk: boolean } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch status and rules on mount
  useEffect(() => {
    if (isOpen) {
      loadStatus();
      loadRules();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/firebase/status');
      const data = await res.json();
      setStatus(data);
      if (data.configured && data.config) {
        setProjectId(data.config.projectId || '');
        setAuthDomain(data.config.authDomain || '');
        setStorageBucket(data.config.storageBucket || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRules = async () => {
    try {
      const res = await fetch('/api/firebase/rules');
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasteJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.appId) setAppId(parsed.appId);
      setShowJsonInput(false);
      setFeedback({ type: 'success', message: 'Config parsed successfully!' });
    } catch (e) {
      setFeedback({ type: 'error', message: 'Invalid JSON format. Please check and try again.' });
    }
  };

  const handleSaveConfig = async () => {
    if (!apiKey || !projectId) {
      setFeedback({ type: 'error', message: 'Project ID and API Key are required.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/firebase/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          projectId,
          authDomain: authDomain || `${projectId}.firebaseapp.com`,
          storageBucket: storageBucket || `${projectId}.appspot.com`,
          appId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save Firebase configuration.');

      setFeedback({ type: 'success', message: 'Firebase bootstrapped! Firestore & Auth SDKs ready in src/lib/firebase.ts' });
      loadStatus();
      loadRules();
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Error configuring Firebase.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    if (!rules.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/firebase/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update firestore.rules');
      setFeedback({ type: 'success', message: 'Security rules validated and saved to firestore.rules!' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Error updating rules.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#0d1117] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-200"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">‹</span>
              <button 
                onClick={() => setActiveTab('setup')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'setup' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Setup
              </button>
              <button 
                onClick={() => setActiveTab('rules')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'rules' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Security Rules
              </button>
              <button 
                onClick={() => setActiveTab('auth')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'auth' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Auth & DB
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === 'code' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                SDK Code
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
          <div className="px-7 pt-4 pb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Firebase Cloud Suite</span>
            {status?.configured ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active ({status.config?.projectId})
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Not Configured
              </span>
            )}
          </div>

          {/* Content Area */}
          <div className="p-7 pt-2 overflow-y-auto max-h-[75vh] space-y-6">
            {activeTab === 'setup' && (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Setup Firebase in Nexus AI
                  </h2>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Configure Firestore Database, Firebase Authentication, and Cloud Storage seamlessly.
                  </p>
                </div>

                {/* Glowing Halo Flame Emblem */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 opacity-60 blur-xl animate-pulse pointer-events-none"></div>
                  <div className="relative w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 shadow-2xl flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                      <Flame className="w-16 h-16 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                    </div>
                  </div>
                </div>

                {/* Quick Option: JSON Paste */}
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowJsonInput(!showJsonInput)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2"
                  >
                    {showJsonInput ? 'Use manual fields' : 'Paste config JSON from Firebase Console'}
                  </button>
                </div>

                {showJsonInput ? (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-medium">Paste Firebase SDK snippet:</label>
                    <textarea 
                      value={rawJson}
                      onChange={(e) => setRawJson(e.target.value)}
                      placeholder='{ "apiKey": "AIzaSy...", "projectId": "my-app", ... }'
                      className="w-full h-28 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                    <button 
                      onClick={handlePasteJson}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition"
                    >
                      Parse & Apply Config
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-amber-400" />
                          Project ID
                        </label>
                        <input 
                          type="text"
                          value={projectId}
                          onChange={(e) => setProjectId(e.target.value)}
                          placeholder="my-firebase-app"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          API Key
                        </label>
                        <input 
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Auth Domain (optional)</label>
                        <input 
                          type="text"
                          value={authDomain}
                          onChange={(e) => setAuthDomain(e.target.value)}
                          placeholder="my-firebase-app.firebaseapp.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 font-medium">Storage Bucket (optional)</label>
                        <input 
                          type="text"
                          value={storageBucket}
                          onChange={(e) => setStorageBucket(e.target.value)}
                          placeholder="my-firebase-app.appspot.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">App ID (optional)</label>
                      <input 
                        type="text"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder="1:1234567890:web:abcdef..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Feedback Notification */}
                {feedback && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    feedback.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{feedback.message}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    onClick={handleSaveConfig}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Bootstrapping Firebase...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4" />
                        <span>Save & Bootstrap Firebase Suite</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Security Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      firestore.rules
                    </h3>
                    <p className="text-xs text-slate-400">Production-grade role-based access control (RBAC) rules.</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(rules)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea 
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    rows={12}
                    className="w-full bg-[#0a0d13] border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-500 leading-relaxed scrollbar-thin"
                  />
                </div>

                {feedback && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    feedback.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{feedback.message}</span>
                  </div>
                )}

                <button 
                  onClick={handleSaveRules}
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Audit & Update firestore.rules</span>
                </button>
              </div>
            )}

            {/* Auth & DB Tab */}
            {activeTab === 'auth' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    Authentication & Database Blueprint
                  </h3>
                  <p className="text-xs text-slate-400">Supported capabilities out of the box in Nexus AI.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Firebase Auth</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Google OAuth, Email/Password, and JWT Session management.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs">
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Firestore Collections</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Real-time listeners (<code className="text-slate-300">onSnapshot</code>), compound queries & subcollections.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cloud Storage</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Secure file uploads, media storage, and automatic download URLs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Security & RBAC</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Granular role checks (admin, editor, user) and field validation.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-2">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    How to ask Nexus AI:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    You can ask Nexus AI directly: <br />
                    <code className="text-amber-300">"Add a login system using Firebase Auth and store user profiles in Firestore"</code>
                    <br />
                    Nexus AI will write the code using the configured Firebase SDK in <code className="text-slate-300">src/lib/firebase.ts</code>!
                  </p>
                </div>
              </div>
            )}

            {/* SDK Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-amber-400" />
                      src/lib/firebase.ts
                    </h3>
                    <p className="text-xs text-slate-400">Centralized Firebase SDK instances ready to import.</p>
                  </div>
                </div>

                <pre className="p-3.5 rounded-xl bg-[#0a0d13] border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  projectId: "${projectId || 'YOUR_PROJECT_ID'}",
  apiKey: "AIzaSy...",
  authDomain: "${authDomain || (projectId ? projectId + '.firebaseapp.com' : 'YOUR_APP.firebaseapp.com')}",
  storageBucket: "${storageBucket || (projectId ? projectId + '.appspot.com' : 'YOUR_APP.appspot.com')}"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);`}
                </pre>

                <p className="text-xs text-slate-400">
                  Import anywhere in your components: <code className="text-amber-400">import &#123; db, auth &#125; from '../lib/firebase';</code>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
