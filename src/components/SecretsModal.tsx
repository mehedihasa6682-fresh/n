import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Key, 
  ShieldCheck, 
  RotateCw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Server,
  Zap,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApiKeyItem, ProviderType, PROVIDER_PRESETS } from '../types/secrets';
import { getLocalKeys, saveLocalKeys, testKeyRemote, getSettings, saveSettings } from '../lib/secretsManager';

interface SecretsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
}

export const SecretsModal: React.FC<SecretsModalProps> = ({ isOpen, onClose, onKeysUpdated }) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<'all' | ProviderType>('all');
  const [isAddingKey, setIsAddingKey] = useState(false);
  
  // New Key Form State
  const [newProvider, setNewProvider] = useState<ProviderType>('openrouter');
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newRpm, setNewRpm] = useState<number>(20);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [keyId: string]: { success: boolean; latencyMs?: number; message?: string } }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Settings
  const [settings, setSettingsState] = useState(getSettings());

  // Load keys on open
  useEffect(() => {
    if (isOpen) {
      const local = getLocalKeys();
      setKeys(local);
      // Fetch pool status from server
      fetch('/api/secrets/pool-status')
        .then(res => res.json())
        .then(data => {
          if (data.pool && Array.isArray(data.pool)) {
            setKeys(prev => prev.map(k => {
              const live = data.pool.find((p: any) => p.id === k.id);
              if (live) {
                return {
                  ...k,
                  status: live.status,
                  cooldownUntil: live.cooldownUntil,
                  requestsThisMinute: live.requestsThisMinute,
                  totalRequests: live.totalRequests,
                  lastError: live.lastError
                };
              }
              return k;
            }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Set default model and name when provider changes in form
  useEffect(() => {
    const preset = PROVIDER_PRESETS[newProvider];
    setNewModel(preset.defaultModel);
    setNewRpm(preset.defaultRpm);
    if (!newName || newName.startsWith('Google') || newName.startsWith('OpenRouter') || newName.startsWith('Grok')) {
      const count = keys.filter(k => k.provider === newProvider).length + 1;
      setNewName(`${preset.name} #${count}`);
    }
  }, [newProvider, keys]);

  // Cooldown countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setKeys(prev => {
        let changed = false;
        const now = Date.now();
        const updated = prev.map(k => {
          if (k.cooldownUntil && k.cooldownUntil > 0) {
            if (k.cooldownUntil <= now) {
              changed = true;
              return { ...k, cooldownUntil: 0, status: 'healthy' as const };
            }
          }
          return k;
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleSaveNewKey = async () => {
    if (!newKey.trim()) return;
    setIsSaving(true);
    const item: ApiKeyItem = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider: newProvider,
      name: newName.trim() || `${PROVIDER_PRESETS[newProvider].name} Key`,
      apiKey: newKey.trim(),
      model: newModel.trim() || PROVIDER_PRESETS[newProvider].defaultModel,
      isActive: true,
      rpmLimit: newRpm || PROVIDER_PRESETS[newProvider].defaultRpm,
      status: 'healthy',
      requestsThisMinute: 0,
      totalRequests: 0,
      cooldownUntil: 0,
    };

    const updated = [...keys, item];
    setKeys(updated);
    saveLocalKeys(updated);
    if (onKeysUpdated) onKeysUpdated();

    // Reset Form
    setNewKey('');
    setIsAddingKey(false);
    setIsSaving(false);
  };

  const handleDeleteKey = (id: string) => {
    const updated = keys.filter(k => k.id !== id);
    setKeys(updated);
    saveLocalKeys(updated);
    if (onKeysUpdated) onKeysUpdated();
  };

  const handleToggleKey = (id: string) => {
    const updated = keys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k);
    setKeys(updated);
    saveLocalKeys(updated);
    if (onKeysUpdated) onKeysUpdated();
  };

  const handleTestKey = async (item: ApiKeyItem) => {
    setTestingKeyId(item.id);
    const res = await testKeyRemote(item.provider, item.apiKey, item.model);
    setTestResult(prev => ({ ...prev, [item.id]: res }));
    setTestingKeyId(null);
  };

  const handleToggleSafePacing = () => {
    const updated = { ...settings, safePacing: !settings.safePacing };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const handleToggleAutoFailover = () => {
    const updated = { ...settings, autoFailover: !settings.autoFailover };
    setSettingsState(updated);
    saveSettings(updated);
  };

  const filteredKeys = selectedProviderFilter === 'all' 
    ? keys 
    : keys.filter(k => k.provider === selectedProviderFilter);

  const activeKeysCount = keys.filter(k => k.isActive).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">API Secrets & Key Pool</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {activeKeysCount} Active Keys
                </span>
              </div>
              <p className="text-xs text-slate-400">
                গুগল এআই স্টুডিও, ওপেন রাউটার ও গ্রোক — আনলিমিটেড ফ্রি এপিআই ও স্মার্ট মিনিট কোটা সুরক্ষা।
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

        {/* Protection Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-emerald-950/30 via-indigo-950/20 to-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">মিনিট কোটা সুরক্ষা চালু:</span>
            <span className="text-slate-300">একটি কী-এর রেট লিমিট শেষ হলে স্বয়ংক্রিয়ভাবে পরবর্তী কী-তে স্যুইচ হবে।</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleSafePacing}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                settings.safePacing 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Throttles requests within 60s sliding window to protect free RPM"
            >
              {settings.safePacing ? '✓ স্মার্ট পেসিং চালু' : 'স্মার্ট পেসিং বন্ধ'}
            </button>
            <button 
              onClick={handleToggleAutoFailover}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                settings.autoFailover 
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Automatically switch keys on 429 quota errors"
            >
              {settings.autoFailover ? '✓ অটো ফেইলওভার' : 'ফেইলওভার বন্ধ'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Provider Filter Tabs & Add Button */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedProviderFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedProviderFilter === 'all' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                সবগুলো ({keys.length})
              </button>
              {(Object.keys(PROVIDER_PRESETS) as ProviderType[]).map((prov) => {
                const preset = PROVIDER_PRESETS[prov];
                const count = keys.filter(k => k.provider === prov).length;
                return (
                  <button
                    key={prov}
                    onClick={() => setSelectedProviderFilter(prov)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      selectedProviderFilter === prov 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{preset.badge}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsAddingKey(!isAddingKey)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingKey ? 'বাতিল করুন' : '+ নতুন API Key যোগ করুন'}</span>
            </button>
          </div>

          {/* Add Key Form Card */}
          <AnimatePresence>
            {isAddingKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-slate-950/80 border border-indigo-500/30 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      নতুন API Key যোগ করুন
                    </h3>
                    <a
                      href={PROVIDER_PRESETS[newProvider].helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>ফ্রি কী সংগ্রহ করুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Provider Selection Buttons */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">প্রোভাইডার নির্বাচন করুন:</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.keys(PROVIDER_PRESETS) as ProviderType[]).map((p) => {
                        const preset = PROVIDER_PRESETS[p];
                        const isSelected = newProvider === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setNewProvider(p)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? `${preset.bgLight} ${preset.border} border-2` 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-bold text-xs text-white flex items-center justify-between">
                              <span>{preset.name}</span>
                              <span className={`text-[10px] ${preset.color}`}>{preset.badge}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{preset.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Key Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1.5 block">কী লেবেল বা নাম:</label>
                      <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="যেমন: OpenRouter Free Key 1"
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>API Key ({PROVIDER_PRESETS[newProvider].keyPrefix}):</span>
                        <button 
                          type="button"
                          onClick={() => setShowKeyPassword(!showKeyPassword)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {showKeyPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showKeyPassword ? 'লুকান' : 'দেখুন'}</span>
                        </button>
                      </label>
                      <input 
                        type={showKeyPassword ? "text" : "password"}
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder={`Paste your ${PROVIDER_PRESETS[newProvider].name} key here...`}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Model Selector & RPM Limit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 mb-1.5 block">মডেল নির্বাচন (ফ্রি মডেলসমূহ সাজেস্টেড):</label>
                      <select
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {PROVIDER_PRESETS[newProvider].freeModels.map(m => (
                          <option key={m.value} value={m.value}>
                            {m.label} — {m.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>মিনিট লিমিট (RPM):</span>
                        <span className="text-[10px] text-slate-400">কোটা সেফগার্ড</span>
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="120"
                        value={newRpm}
                        onChange={(e) => setNewRpm(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Save action */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingKey(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={!newKey.trim() || isSaving}
                      onClick={handleSaveNewKey}
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-indigo-600/30"
                    >
                      {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'কী সংরক্ষণ করুন'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Key Pool List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>সংরক্ষিত কী তালিকা ({filteredKeys.length})</span>
              <span>রোটেশন স্ট্যাটাস & কোটা ব্যবহার</span>
            </div>

            {filteredKeys.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center">
                <Key className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-300">কোনো API Key পাওয়া যায়নি</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  ওপেন রাউটার, গ্রোক অথবা গুগল এআই স্টুডিও এর ফ্রি কী যুক্ত করুন যাতে আনলিমিটেড স্পিড ও ব্যাকআপ নিশ্চিত হয়।
                </p>
                <button
                  onClick={() => setIsAddingKey(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>এখনই কী যোগ করুন</span>
                </button>
              </div>
            ) : (
              filteredKeys.map((item) => {
                const preset = PROVIDER_PRESETS[item.provider] || PROVIDER_PRESETS.gemini;
                const inCooldown = item.cooldownUntil && item.cooldownUntil > Date.now();
                const cooldownSec = inCooldown ? Math.ceil((item.cooldownUntil! - Date.now()) / 1000) : 0;
                const isTesting = testingKeyId === item.id;
                const test = testResult[item.id];
                const masked = item.apiKey.length > 8 
                  ? `${item.apiKey.slice(0, 4)}...${item.apiKey.slice(-4)}`
                  : '••••••••';

                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      item.isActive 
                        ? inCooldown
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Left: Info */}
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${preset.bgLight} border ${preset.border} flex items-center justify-center flex-shrink-0`}>
                          <Key className={`w-4 h-4 ${preset.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{item.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${preset.bgLight} ${preset.color} border ${preset.border}`}>
                              {preset.badge}
                            </span>
                            {/* Status Indicator */}
                            {inCooldown ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                                <Clock className="w-2.5 h-2.5" />
                                <span>কুলডাউন: {cooldownSec}s</span>
                              </span>
                            ) : item.isActive ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>রেডি</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-semibold">নিষ্ক্রিয়</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span className="text-slate-300">{masked}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-indigo-400 font-sans">{item.model}</span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1 font-sans text-slate-400">
                              <Gauge className="w-3 h-3 text-slate-500" />
                              <span>{item.requestsThisMinute || 0}/{item.rpmLimit || preset.defaultRpm} RPM</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Controls & Actions */}
                      <div className="flex items-center gap-2">
                        {/* Test Button */}
                        <button
                          onClick={() => handleTestKey(item)}
                          disabled={isTesting}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/60 transition-all flex items-center gap-1"
                          title="Test API Key Connectivity"
                        >
                          <RotateCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-indigo-400' : ''}`} />
                          <span>{isTesting ? 'টেস্টিং...' : 'টেস্ট'}</span>
                        </button>

                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() => handleToggleKey(item.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            item.isActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {item.isActive ? 'অন' : 'অফ'}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteKey(item.id)}
                          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 flex items-center justify-center transition-all border border-slate-800 hover:border-red-500/30"
                          title="Delete Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Test Result Message */}
                    {test && (
                      <div className={`mt-2.5 pt-2.5 border-t border-slate-800/80 text-xs flex items-center gap-2 ${
                        test.success ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {test.success ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                        <span>{test.message || (test.success ? `সফলভাবে সংযুক্ত (${test.latencyMs}ms)` : 'কানেকশন ব্যর্থ হয়েছে')}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Built-in Environment Fallback Info */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Default Built-in AI Studio Fallback</div>
                <div className="text-slate-400 text-[11px]">সার্ভার এনভায়রনমেন্ট কি প্রস্তুত রয়েছে, যা কোনো কি ব্যর্থ হলে অটো ব্যাকআপ হিসেবে কাজ করবে।</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>স্ট্যান্ডবাই অন</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>টুলস এবং ওয়েবসাইট জেনারেশন স্বয়ংক্রিয়ভাবে একটিভ কি-তে এক্সিকিউট হবে।</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            সম্পন্ন
          </button>
        </div>
      </motion.div>
    </div>
  );
};
