import path from 'path';
import fs from 'fs';

type Agent = {
  id: number;
  wallet_address: string;
  name: string;
  telegram_token: string;
  allowed_chat_id?: string;
  llm_provider: string;
  llm_api_key: string;
  system_prompt: string;
  created_at: string;
};

type Thread = {
  id: number;
  agent_id: number;
  chat_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: number;
  thread_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
};

type Memory = {
  id: number;
  agent_id: number;
  chat_id: string;
  key: string;
  value: string;
  confidence: number;
  source_message_id?: number;
  updated_at: string;
};

type LexagentData = {
  agents: Agent[];
  threads: Thread[];
  messages: Message[];
  memories: Memory[];
};

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'lexagent.json');

// Initialize DB file if not exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify({ agents: [], threads: [], messages: [], memories: [] }, null, 2)
  );
}

class JsonDB {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  private read(): LexagentData {
    const raw = JSON.parse(fs.readFileSync(this.path, 'utf-8')) as Partial<LexagentData>;
    return {
      agents: Array.isArray(raw.agents) ? raw.agents : [],
      threads: Array.isArray(raw.threads) ? raw.threads : [],
      messages: Array.isArray(raw.messages) ? raw.messages : [],
      memories: Array.isArray(raw.memories) ? raw.memories : [],
    };
  }

  private write(data: LexagentData) {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }

  getAgentsByWallet(walletAddress: string) {
    const data = this.read();
    return data.agents.filter((a) => a.wallet_address === walletAddress);
  }

  getAgentByToken(token: string) {
    const data = this.read();
    return data.agents.find((a) => a.telegram_token === token);
  }

  getAllAgents() {
    const data = this.read();
    return data.agents;
  }

  createAgent(agent: Omit<Agent, 'id' | 'created_at'>) {
    const data = this.read();
    const newAgent: Agent = { ...agent, id: Date.now(), created_at: new Date().toISOString() };
    data.agents.push(newAgent);
    this.write(data);
    return { lastInsertRowid: newAgent.id };
  }

  getOrCreateThread(agentId: number, chatId: string, title?: string, forceNew: boolean = false) {
    const data = this.read();
    const now = new Date().toISOString();

    if (forceNew) {
      const newThread: Thread = {
        id: Date.now(),
        agent_id: agentId,
        chat_id: chatId,
        title: title || `Chat ${chatId}`,
        created_at: now,
        updated_at: now,
      };
      data.threads.push(newThread);
      this.write(data);
      return newThread;
    }

    const existing = data.threads
      .filter((t) => t.agent_id === agentId && t.chat_id === chatId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    let thread = existing[0];

    if (!thread) {
      thread = {
        id: Date.now(),
        agent_id: agentId,
        chat_id: chatId,
        title: title || `Chat ${chatId}`,
        created_at: now,
        updated_at: now,
      };
      data.threads.push(thread);
      this.write(data);
      return thread;
    }

    if (title && !thread.title) {
      thread.title = title;
      thread.updated_at = now;
      this.write(data);
    }

    return thread;
  }

  getThreads(agentId?: number, chatId?: string) {
    const data = this.read();
    return data.threads.filter((t) => {
      if (agentId && t.agent_id !== agentId) return false;
      if (chatId && t.chat_id !== chatId) return false;
      return true;
    });
  }

  addMessage(threadId: number, role: 'user' | 'assistant' | 'system', content: string) {
    const data = this.read();
    const now = new Date().toISOString();
    const message: Message = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      thread_id: threadId,
      role,
      content,
      created_at: now,
    };
    data.messages.push(message);

    const thread = data.threads.find((t) => t.id === threadId);
    if (thread) thread.updated_at = now;

    this.write(data);
    return message;
  }

  getMessagesByThread(threadId: number, limit: number = 20) {
    const data = this.read();
    return data.messages
      .filter((m) => m.thread_id === threadId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-Math.max(1, limit));
  }

  resetThread(threadId: number) {
    const data = this.read();
    data.messages = data.messages.filter((m) => m.thread_id !== threadId);
    const thread = data.threads.find((t) => t.id === threadId);
    if (thread) thread.updated_at = new Date().toISOString();
    this.write(data);
    return { success: true };
  }

  upsertMemory(
    agentId: number,
    chatId: string,
    key: string,
    value: string,
    confidence: number = 0.7,
    sourceMessageId?: number
  ) {
    const data = this.read();
    const now = new Date().toISOString();
    const existing = data.memories.find(
      (m) => m.agent_id === agentId && m.chat_id === chatId && m.key === key
    );

    if (existing) {
      existing.value = value;
      existing.confidence = confidence;
      existing.source_message_id = sourceMessageId;
      existing.updated_at = now;
      this.write(data);
      return existing;
    }

    const memory: Memory = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      agent_id: agentId,
      chat_id: chatId,
      key,
      value,
      confidence,
      source_message_id: sourceMessageId,
      updated_at: now,
    };
    data.memories.push(memory);
    this.write(data);
    return memory;
  }

  getMemories(agentId: number, chatId: string, limit: number = 10) {
    const data = this.read();
    const now = Date.now();
    const ttlMs = 30 * 24 * 60 * 60 * 1000;

    return data.memories
      .filter((m) => {
        if (!(m.agent_id === agentId && m.chat_id === chatId)) return false;
        const ageMs = now - new Date(m.updated_at).getTime();
        if (m.confidence < 0.8 && ageMs > ttlMs) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, Math.max(1, limit));
  }

  deleteMemoryByKey(agentId: number, chatId: string, key: string) {
    const data = this.read();
    const before = data.memories.length;
    const normalized = key.trim().toLowerCase();
    data.memories = data.memories.filter(
      (m) => !(m.agent_id === agentId && m.chat_id === chatId && m.key.toLowerCase() === normalized)
    );
    this.write(data);
    return { success: data.memories.length < before };
  }

  deleteMemory(id: number) {
    const data = this.read();
    const before = data.memories.length;
    data.memories = data.memories.filter((m) => m.id !== id);
    this.write(data);
    return { success: data.memories.length < before };
  }
}

const db = new JsonDB(dbPath);
export default db;
