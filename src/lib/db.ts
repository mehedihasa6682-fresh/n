/**
 * IndexedDB offline storage for Nexus AI Chat History
 * Pure native IndexedDB API - zero dependency, works seamlessly offline in PWA & Browser.
 */

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  imageUrl?: string;
  timestamp?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  mode: 'general' | 'coding' | 'image' | 'search';
  generatedHtml?: string;
  previewUrl?: string;
}

/**
 * Extracts complete HTML code block from chat messages if available
 */
export function extractHtmlFromChatMessages(messages: ChatMessage[]): string | null {
  if (!messages || messages.length === 0) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === 'model') {
      const text = m.parts?.[0]?.text || '';
      const codeBlockMatch = text.match(/```(?:html|htm)\s*([\s\S]*?)```/i);
      if (codeBlockMatch && codeBlockMatch[1] && codeBlockMatch[1].includes('<')) {
        return codeBlockMatch[1].trim();
      }
      const docMatch = text.match(/(<!DOCTYPE\s+html[\s\S]*?<\/html>)/i);
      if (docMatch && docMatch[1]) {
        return docMatch[1].trim();
      }
      const htmlMatch = text.match(/(<html[\s\S]*?<\/html>)/i);
      if (htmlMatch && htmlMatch[1]) {
        return `<!DOCTYPE html>\n${htmlMatch[1].trim()}`;
      }
    }
  }
  return null;
}

const DB_NAME = 'NexusAIDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'chat_sessions';

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function getAllSessions(): Promise<ChatSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SESSIONS, 'readonly');
    const store = tx.objectStore(STORE_SESSIONS);
    const index = store.index('updatedAt');
    const request = index.openCursor(null, 'prev'); // sort descending by updatedAt

    const sessions: ChatSession[] = [];
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        sessions.push(cursor.value);
        cursor.continue();
      } else {
        resolve(sessions);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getSession(id: string): Promise<ChatSession | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SESSIONS, 'readonly');
    const store = tx.objectStore(STORE_SESSIONS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSession(session: ChatSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);
    const request = store.put({ ...session, updatedAt: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllSessions(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SESSIONS, 'readwrite');
    const store = tx.objectStore(STORE_SESSIONS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function generateSessionTitle(firstPrompt: string): string {
  const clean = firstPrompt.trim().replace(/\n/g, ' ');
  if (clean.length <= 32) return clean || 'New Chat';
  return clean.slice(0, 32) + '...';
}
