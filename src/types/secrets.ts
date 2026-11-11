export type ProviderType = 'gemini' | 'openrouter' | 'grok';

export interface ApiKeyItem {
  id: string;
  provider: ProviderType;
  name: string;
  apiKey: string;
  model: string;
  isActive: boolean;
  rpmLimit: number; // Requests per minute quota limit
  status?: 'healthy' | 'cooldown' | 'error';
  cooldownUntil?: number; // timestamp in ms
  lastUsedAt?: number;
  requestsThisMinute?: number;
  totalRequests?: number;
  lastError?: string | null;
  latencyMs?: number;
}

export interface ProviderPreset {
  id: ProviderType;
  name: string;
  banglaName: string;
  description: string;
  badge: string;
  color: string;
  bgLight: string;
  border: string;
  defaultModel: string;
  freeModels: { label: string; value: string; desc: string }[];
  defaultRpm: number;
  keyPrefix: string;
  helpUrl: string;
}

export interface SettingsConfig {
  autoFailover: boolean;
  safePacing: boolean;
  minRequestIntervalMs: number;
  preferredProvider: 'all' | ProviderType;
}

export const PROVIDER_PRESETS: Record<ProviderType, ProviderPreset> = {
  gemini: {
    id: 'gemini',
    name: 'Google AI Studio',
    banglaName: 'গুগল এআই স্টুডিও',
    description: 'Google AI Studio Gemini API keys with multi-agent tool execution.',
    badge: 'Gemini',
    color: 'text-sky-400',
    bgLight: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    defaultModel: 'gemini-3.8-flash',
    freeModels: [
      { label: 'Gemini 3.8 Flash (Latest Flagship - Recommended)', value: 'gemini-3.8-flash', desc: '15 RPM free, high speed & full tools' },
      { label: 'Gemini Flash Latest', value: 'gemini-flash-latest', desc: 'Fastest auto-updated flagship alias' },
      { label: 'Gemini 3.1 Flash Lite', value: 'gemini-3.1-flash-lite', desc: 'High-speed lightweight responsive model' },
    ],
    defaultRpm: 15,
    keyPrefix: 'AIzaSy...',
    helpUrl: 'https://aistudio.google.com/app/apikey',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    banglaName: 'ওপেন রাউটার',
    description: 'Access 100% free models including LLaMA 3.3, DeepSeek, and Qwen.',
    badge: 'OpenRouter',
    color: 'text-violet-400',
    bgLight: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    defaultModel: 'google/gemini-2.0-flash-lite:free',
    freeModels: [
      { label: 'Gemini 2.0 Flash Lite (Free)', value: 'google/gemini-2.0-flash-lite:free', desc: '100% Free, zero credit cost' },
      { label: 'DeepSeek Chat (V3)', value: 'deepseek/deepseek-chat', desc: 'Official DeepSeek Chat slug' },
      { label: 'Llama 3.3 70B Instruct (Free)', value: 'meta-llama/llama-3.3-70b-instruct:free', desc: '100% Free, high quality coding' },
      { label: 'Qwen 2.5 Coder 32B (Free)', value: 'qwen/qwen-2.5-coder-32b-instruct:free', desc: '100% Free, specialized coding model' },
      { label: 'Mistral 7B Instruct (Free)', value: 'mistralai/mistral-7b-instruct:free', desc: '100% Free, lightweight & agile' },
    ],
    defaultRpm: 20,
    keyPrefix: 'sk-or-v1-...',
    helpUrl: 'https://openrouter.ai/keys',
  },
  grok: {
    id: 'grok',
    name: 'Grok (xAI)',
    banglaName: 'গ্রোক (xAI)',
    description: 'xAI Grok high-speed intelligence API keys with witty reasoning.',
    badge: 'Grok',
    color: 'text-amber-400',
    bgLight: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    defaultModel: 'grok-2-latest',
    freeModels: [
      { label: 'Grok 2 Latest', value: 'grok-2-latest', desc: 'Flagship Grok reasoning and code' },
      { label: 'Grok Beta', value: 'grok-beta', desc: 'High-speed Grok model' },
      { label: 'Grok 2 Vision (128k)', value: 'grok-2-vision-128k', desc: 'Large context window' },
    ],
    defaultRpm: 30,
    keyPrefix: 'xai-...',
    helpUrl: 'https://console.x.ai/',
  },
};
