import React from 'react';
import { 
  X, 
  Wrench, 
  FileText, 
  FilePlus, 
  FileCode, 
  Trash2, 
  Folder, 
  Move, 
  Search, 
  FileSearch, 
  Terminal, 
  Globe, 
  Download, 
  Image as ImageIcon, 
  ShieldCheck, 
  ListOrdered, 
  Cpu, 
  Package,
  Hammer,
  CheckCheck,
  RefreshCw,
  GitBranch,
  GitCommit as GitCommitIcon,
  GitCompare,
  Database,
  Network,
  Activity,
  KeyRound,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Compass,
  MousePointer,
  Keyboard,
  Camera,
  CheckSquare,
  Bot,
  Binary,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  SlidersHorizontal,
  Flame,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TOOLS_LIST = [
  {
    id: 'fileRead',
    name: 'File Read',
    category: 'File System',
    icon: FileText,
    desc: 'Reads source code or document contents from workspace files.'
  },
  {
    id: 'fileWrite',
    name: 'File Write',
    category: 'File System',
    icon: FilePlus,
    desc: 'Creates new code files or overwrites existing ones with directories.'
  },
  {
    id: 'fileEdit',
    name: 'File Edit',
    category: 'File System',
    icon: FileCode,
    desc: 'Surgically replaces specific chunks of text inside existing files.'
  },
  {
    id: 'fileDelete',
    name: 'File Delete',
    category: 'File System',
    icon: Trash2,
    desc: 'Removes unused or obsolete files and folders safely.'
  },
  {
    id: 'listDir',
    name: 'Directory Listing',
    category: 'File System',
    icon: Folder,
    desc: 'Lists directory structures, folders, and project assets.'
  },
  {
    id: 'moveFile',
    name: 'Move & Rename',
    category: 'File System',
    icon: Move,
    desc: 'Renames or relocates files and subdirectories.'
  },
  {
    id: 'glob',
    name: 'Pattern Finder',
    category: 'Search & Navigation',
    icon: Search,
    desc: 'Finds files matching wildcard patterns (e.g., src/**/*.tsx).'
  },
  {
    id: 'grep',
    name: 'Code Grep',
    category: 'Search & Navigation',
    icon: FileSearch,
    desc: 'Searches for text keywords, function names, and regex across files.'
  },
  {
    id: 'bash',
    name: 'Bash Execution',
    category: 'Terminal',
    icon: Terminal,
    desc: 'Executes build commands, scripts, and shell operations.'
  },
  {
    id: 'installPackage',
    name: 'Package Installer',
    category: 'Dependencies',
    icon: Package,
    desc: 'Installs npm dependencies directly into package.json.'
  },
  {
    id: 'compileProject',
    name: 'Build Compiler',
    category: 'Code Quality',
    icon: Hammer,
    desc: 'Runs full TypeScript compiler to verify zero build errors.'
  },
  {
    id: 'lintProject',
    name: 'Linter & Validator',
    category: 'Code Quality',
    icon: CheckCheck,
    desc: 'Validates syntax, types, and imports before finishing tasks.'
  },
  {
    id: 'restartServer',
    name: 'Server Restarter',
    category: 'Dev Ops',
    icon: RefreshCw,
    desc: 'Restarts and refreshes dev server on config or route changes.'
  },
  {
    id: 'gitStatus',
    name: 'Git Status',
    category: 'Version Control',
    icon: GitBranch,
    desc: 'Inspects active branch and tracking status of modified files.'
  },
  {
    id: 'gitCommit',
    name: 'Git Commit',
    category: 'Version Control',
    icon: GitCommitIcon,
    desc: 'Stages repository changes and commits with messages.'
  },
  {
    id: 'gitDiff',
    name: 'Git Diff Inspector',
    category: 'Version Control',
    icon: GitCompare,
    desc: 'Shows line-by-line diffs between working directory and HEAD.'
  },
  {
    id: 'sendHttpRequest',
    name: 'HTTP / API Client',
    category: 'API & Network',
    icon: Network,
    desc: 'Calls REST/GraphQL APIs with custom methods, headers, and body.'
  },
  {
    id: 'testApiEndpoint',
    name: 'API Latency Tester',
    category: 'API & Network',
    icon: Activity,
    desc: 'Benchmarks endpoint ping, latency in ms, and response status.'
  },
  {
    id: 'setEnvVariable',
    name: 'Environment Config',
    category: 'Environment',
    icon: KeyRound,
    desc: 'Writes and secures API keys and environment variables in .env.'
  },
  {
    id: 'scanVulnerabilities',
    name: 'Vulnerability Scanner',
    category: 'Security',
    icon: ShieldAlert,
    desc: 'Runs npm audit to detect security flaws in project dependencies.'
  },
  {
    id: 'detectSecrets',
    name: 'Secret Leak Detector',
    category: 'Security',
    icon: ShieldCheck,
    desc: 'Scans source code to prevent accidentally committed tokens & passwords.'
  },
  {
    id: 'sendWebhook',
    name: 'Webhook Dispatcher',
    category: 'Notifications',
    icon: Bell,
    desc: 'Triggers Discord, Slack, or custom webhook alerts and web payloads.'
  },
  {
    id: 'executeSqlQuery',
    name: 'SQL Database Engine',
    category: 'Database',
    icon: Database,
    desc: 'Executes SQL schema queries, migrations, and test data seeding.'
  },
  {
    id: 'launchBrowser',
    name: 'Headless Browser',
    category: 'Browser Testing',
    icon: Compass,
    desc: 'Launches sandboxed browser instance for UI and rendering tests.'
  },
  {
    id: 'navigateToUrl',
    name: 'URL Navigator',
    category: 'Browser Testing',
    icon: Globe,
    desc: 'Directs browser to web URL and checks response codes and DOM.'
  },
  {
    id: 'clickElement',
    name: 'DOM Click Simulator',
    category: 'Browser Testing',
    icon: MousePointer,
    desc: 'Simulates user click events on specified CSS selectors.'
  },
  {
    id: 'typeText',
    name: 'Input Typing Simulator',
    category: 'Browser Testing',
    icon: Keyboard,
    desc: 'Simulates keyboard strokes and user input in forms and textareas.'
  },
  {
    id: 'takeScreenshot',
    name: 'Viewport Screenshot',
    category: 'Browser Testing',
    icon: Camera,
    desc: 'Captures rendered visual snapshot of the application viewport.'
  },
  {
    id: 'runE2eTests',
    name: 'E2E Test Runner',
    category: 'Browser Testing',
    icon: CheckSquare,
    desc: 'Executes comprehensive end-to-end integration and user journey tests.'
  },
  {
    id: 'callLlmApi',
    name: 'Multi-LLM Dispatcher',
    category: 'AI & ML Ops',
    icon: Bot,
    desc: 'Routes queries to secondary LLMs and specialized reasoning models.'
  },
  {
    id: 'generateEmbeddings',
    name: 'Vector Embeddings',
    category: 'AI & ML Ops',
    icon: Binary,
    desc: 'Generates high-dimensional vector embeddings for semantic search.'
  },
  {
    id: 'searchVectorDb',
    name: 'Vector DB Search',
    category: 'AI & ML Ops',
    icon: Search,
    desc: 'Performs cosine similarity searches across vectorized documents.'
  },
  {
    id: 'fineTuneModel',
    name: 'Model Fine-Tuner',
    category: 'AI & ML Ops',
    icon: SlidersHorizontal,
    desc: 'Validates JSONL training datasets and monitors fine-tuning jobs.'
  },
  {
    id: 'runSecurityAudit',
    name: 'Deep Security Audit',
    category: 'Security',
    icon: ShieldAlert,
    desc: 'Scans dependencies, CSP headers, and access permissions.'
  },
  {
    id: 'scrapeWebPage',
    name: 'Web Scraper & Parser',
    category: 'Data Extraction',
    icon: Download,
    desc: 'Scrapes and cleans HTML content into structured markdown text.'
  },
  {
    id: 'parsePdf',
    name: 'PDF Parser',
    category: 'Data Extraction',
    icon: FileText,
    desc: 'Extracts text, metadata, and tables from PDF documents.'
  },
  {
    id: 'parseExcel',
    name: 'Spreadsheet Parser',
    category: 'Data Extraction',
    icon: FileSpreadsheet,
    desc: 'Parses CSV, XLSX, and spreadsheet rows into structured JSON.'
  },
  {
    id: 'sendSlackNotification',
    name: 'Slack Webhook Alert',
    category: 'Notifications',
    icon: MessageSquare,
    desc: 'Sends formatted alerts and CI build statuses to Slack channels.'
  },
  {
    id: 'sendDiscordWebhook',
    name: 'Discord Webhook Embed',
    category: 'Notifications',
    icon: Bell,
    desc: 'Dispatches rich embed notifications to Discord community webhooks.'
  },
  {
    id: 'sendEmailNotification',
    name: 'Email Dispatcher',
    category: 'Notifications',
    icon: Mail,
    desc: 'Sends automated email notifications and daily reports to teams.'
  },
  {
    id: 'webSearch',
    name: 'Web Search',
    category: 'Live Intelligence',
    icon: Globe,
    desc: 'Queries DuckDuckGo and Google for real-time live facts & docs.'
  },
  {
    id: 'webFetch',
    name: 'Web Fetcher',
    category: 'Live Intelligence',
    icon: Download,
    desc: 'Scrapes and reads articles, APIs, and webpage content.'
  },
  {
    id: 'generateImage',
    name: 'Image Generator',
    category: 'Media Creation',
    icon: ImageIcon,
    desc: 'Generates banners, logos, and UI graphics based on prompts.'
  },
  {
    id: 'analyzeProject',
    name: 'Project Auditor',
    category: 'Code Quality',
    icon: ShieldCheck,
    desc: 'Performs SEO, performance, and security audits on web apps.'
  },
  {
    id: 'plan',
    name: 'Task Planner',
    category: 'Orchestration',
    icon: ListOrdered,
    desc: 'Builds structured step-by-step blueprints before execution.'
  },
  {
    id: 'agent',
    name: 'Multi-Agent Spawn',
    category: 'Orchestration',
    icon: Cpu,
    desc: 'Spawns specialized autonomous sub-agents (Coder, Architect, Reviewer).'
  },
  {
    id: 'firebaseSetup',
    name: 'Firebase Provisioner',
    category: 'Cloud & Database',
    icon: Flame,
    desc: 'Initializes Firebase client/admin SDKs, Firestore DB, and Auth instances.'
  },
  {
    id: 'deploySecurityRules',
    name: 'Firestore Security Rules',
    category: 'Security & DB',
    icon: ShieldCheck,
    desc: 'Generates, audits, and deploys strict RBAC security rules for collections.'
  },
  {
    id: 'firestoreManager',
    name: 'Firestore DB Engine',
    category: 'Cloud & Database',
    icon: Database,
    desc: 'Handles Firestore collections, real-time listeners, and document CRUD.'
  },
  {
    id: 'firebaseAuth',
    name: 'Firebase Auth Suite',
    category: 'Authentication',
    icon: UserCheck,
    desc: 'Manages user sign-in (Google/Email), JWT sessions, and user roles.'
  }
];

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-100 text-base">Nexus AI Active Tools</h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    {TOOLS_LIST.length}/{TOOLS_LIST.length} Online
                  </span>
                </div>
                <p className="text-xs text-slate-400">Integrated autonomous engineering & execution suite</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tools Grid */}
          <div className="p-6 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOOLS_LIST.map((tool, idx) => (
                <div 
                  key={tool.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-slate-900 text-indigo-400 border border-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {idx + 1}. {tool.name}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                      {tool.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>All 15 tools are wired to Gemini Function Calling.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
