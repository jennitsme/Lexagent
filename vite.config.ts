import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';

function extractMemoriesFromText(text: string): Array<{ key: string; value: string; confidence: number }> {
  const normalized = text.trim();
  const items: Array<{ key: string; value: string; confidence: number }> = [];

  const patterns = [
    { regex: /(?:my name is|call me)\s+([a-zA-Z0-9_\- ]{2,40})/i, key: 'user_name', confidence: 0.95 },
    { regex: /i prefer\s+(.{3,120})/i, key: 'preference', confidence: 0.8 },
    { regex: /don't\s+(.{3,120})/i, key: 'dislike_or_constraint', confidence: 0.75 },
    { regex: /always\s+(.{3,120})/i, key: 'always_rule', confidence: 0.75 },
    { regex: /remember that\s+(.{3,160})/i, key: 'remembered_fact', confidence: 0.9 },
  ];

  const secretLike = /(seed phrase|private key|api[_ -]?key|mnemonic|secret key)/i;

  for (const p of patterns) {
    const m = normalized.match(p.regex);
    if (m?.[1]) {
      const value = m[1].trim();
      if (!secretLike.test(value) && p.confidence >= 0.8) {
        items.push({ key: p.key, value, confidence: p.confidence });
      }
    }
  }

  return items;
}

function buildModelMessages(
  systemPrompt: string,
  memories: Array<{ key: string; value: string }>,
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userText: string
) {
  const memoryBlock = memories.length
    ? `\nKnown user memories:\n${memories.map((m) => `- ${m.key}: ${m.value}`).join('\n')}`
    : '';

  const system = `${systemPrompt}${memoryBlock}\nUse memories only when relevant. Keep responses concise.`;

  return [
    { role: 'system' as const, content: system },
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
    { role: 'user' as const, content: userText },
  ];
}

function apiPlugin(): Plugin {
  return {
    name: 'api-routes',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) return next();

        let body = '';
        await new Promise<void>((resolve) => {
          req.on('data', (chunk: string) => { body += chunk; });
          req.on('end', () => resolve());
        });
        let json: any = {};
        if (body) {
          try {
            json = JSON.parse(body);
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          }
        }

        try {
          const { default: db } = await server.ssrLoadModule('./src/db/index.ts');

          if (req.url.startsWith('/api/agents') && req.method === 'GET') {
            const u = new URL(req.url, 'http://localhost');
            const wa = u.searchParams.get('walletAddress');
            if (!wa) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Wallet address required' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.getAgentsByWallet(wa)));
          }

          if (req.url === '/api/agents' && req.method === 'POST') {
            const { walletAddress, name, telegramToken, allowedChatId, llmProvider, llmApiKey, systemPrompt } = json;
            if (!walletAddress || !name || !telegramToken || !llmProvider || !llmApiKey) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Missing required fields' }));
            }
            const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
            const bot = new TelegramBot(telegramToken, { polling: false });
            const botInfo = await bot.getMe();
            const appUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null);
            if (appUrl) {
              await bot.setWebHook(`${appUrl}/api/telegram/webhook/${telegramToken}`);
            }
            const result = db.createAgent({
              wallet_address: walletAddress, name,
              telegram_token: telegramToken, allowed_chat_id: allowedChatId,
              llm_provider: llmProvider, llm_api_key: llmApiKey,
              system_prompt: systemPrompt || 'You are a helpful AI agent.'
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, agentId: result.lastInsertRowid, botName: botInfo.username }));
          }

          if (req.url === '/api/agent-chat' && req.method === 'POST') {
            const { message } = json || {};
            if (!message || typeof message !== 'string') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Message is required' }));
            }

            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on server' }));
            }

            const { default: OpenAI } = await server.ssrLoadModule('openai');
            const openai = new OpenAI({ apiKey });
            const c = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              temperature: 0,
              messages: [
                {
                  role: 'system',
                  content: 'You are a wallet transaction interpreter. Convert user chat into JSON only. JSON schema: {"intent":"send_sol"|"chat", "amountSol":number|null, "toAddress":string|null, "reply":string}. If user clearly asks to send SOL and includes amount + destination wallet, set intent=send_sol. Otherwise intent=chat and give helpful reply. Output must be pure JSON without markdown.'
                },
                { role: 'user', content: message },
              ],
            });

            const raw = c.choices[0].message.content || '{}';
            let parsed: any;
            try {
              parsed = JSON.parse(raw);
            } catch {
              const match = raw.match(/\{[\s\S]*\}/);
              parsed = match ? JSON.parse(match[0]) : null;
            }

            const payload = {
              intent: parsed?.intent === 'send_sol' ? 'send_sol' : 'chat',
              amountSol: typeof parsed?.amountSol === 'number' ? parsed.amountSol : null,
              toAddress: typeof parsed?.toAddress === 'string' ? parsed.toAddress : null,
              reply: typeof parsed?.reply === 'string' ? parsed.reply : "I couldn't parse that. Try: send 0.1 SOL to <wallet_address>",
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(payload));
          }

          if (req.url.startsWith('/api/threads') && req.method === 'GET' && !req.url.includes('/messages')) {
            const u = new URL(req.url, 'http://localhost');
            const agentId = u.searchParams.get('agentId') ? Number(u.searchParams.get('agentId')) : undefined;
            const chatId = u.searchParams.get('chatId') || undefined;
            if (!agentId && !chatId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'agentId or chatId is required' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.getThreads(agentId, chatId)));
          }

          const threadMessagesMatch = req.url.match(/^\/api\/threads\/(\d+)\/messages(\?.*)?$/);
          if (threadMessagesMatch && req.method === 'GET') {
            const u = new URL(req.url, 'http://localhost');
            const threadId = Number(threadMessagesMatch[1]);
            const limit = u.searchParams.get('limit') ? Number(u.searchParams.get('limit')) : 50;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.getMessagesByThread(threadId, limit)));
          }

          const threadResetMatch = req.url.match(/^\/api\/threads\/(\d+)\/reset$/);
          if (threadResetMatch && req.method === 'POST') {
            const threadId = Number(threadResetMatch[1]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.resetThread(threadId)));
          }

          if (req.url.startsWith('/api/memories') && req.method === 'GET') {
            const u = new URL(req.url, 'http://localhost');
            const agentId = Number(u.searchParams.get('agentId'));
            const chatId = String(u.searchParams.get('chatId') || '');
            if (!agentId || !chatId) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'agentId and chatId are required' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.getMemories(agentId, chatId, 50)));
          }

          const memDeleteMatch = req.url.match(/^\/api\/memories\/(\d+)$/);
          if (memDeleteMatch && req.method === 'DELETE') {
            const id = Number(memDeleteMatch[1]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(db.deleteMemory(id)));
          }

          const wm = req.url.match(/^\/api\/telegram\/webhook\/(.+)$/);
          if (wm && req.method === 'POST') {
            const token = wm[1];
            res.writeHead(200);
            res.end();
            if (!json.message?.text) return;
            const chatId = json.message.chat.id;
            const text = json.message.text;
            const agent = db.getAgentByToken(token);
            if (!agent) return;
            if (agent.allowed_chat_id && agent.allowed_chat_id.toString() !== chatId.toString()) {
              const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
              const bot = new TelegramBot(token, { polling: false });
              await bot.sendMessage(chatId, 'Access denied.');
              return;
            }

            const chatIdStr = String(chatId);

            if (text.trim().toLowerCase() === '/newthread') {
              const newThread = db.getOrCreateThread(
                agent.id,
                chatIdStr,
                json.message.chat.title || json.message.from?.first_name || `Chat ${chatId}`,
                true
              );
              const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
              const bot = new TelegramBot(token, { polling: false });
              await bot.sendMessage(chatId, `Started a new thread. Context reset. (thread: ${newThread.id})`);
              return;
            }

            if (text.trim().toLowerCase() === '/memory') {
              const memories = db.getMemories(agent.id, chatIdStr, 20);
              const lines = memories.length
                ? memories.map((m: any) => `- ${m.key}: ${m.value}`).join('\n')
                : 'No memory stored yet.';
              const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
              const bot = new TelegramBot(token, { polling: false });
              await bot.sendMessage(chatId, `Current memory:\n${lines}`);
              return;
            }

            if (text.trim().toLowerCase().startsWith('/forget ')) {
              const key = text.trim().slice('/forget '.length).trim();
              const result = db.deleteMemoryByKey(agent.id, chatIdStr, key);
              const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
              const bot = new TelegramBot(token, { polling: false });
              await bot.sendMessage(chatId, result.success ? `Forgot memory key: ${key}` : `No memory found for key: ${key}`);
              return;
            }

            const thread = db.getOrCreateThread(agent.id, chatIdStr, json.message.chat.title || json.message.from?.first_name || `Chat ${chatId}`);
            const userMsg = db.addMessage(thread.id, 'user', text);
            const recentMessages = db.getMessagesByThread(thread.id, 12).slice(-10);
            const memories = db.getMemories(agent.id, chatIdStr, 10);

            const modelMessages = buildModelMessages(
              agent.system_prompt,
              memories.map((m: any) => ({ key: m.key, value: m.value })),
              recentMessages.filter((m: any) => m.id !== userMsg.id).map((m: any) => ({ role: m.role, content: m.content })),
              text
            );

            let responseText = "I'm sorry, I couldn't process that.";
            if (agent.llm_provider === 'gemini') {
              const { GoogleGenAI } = await server.ssrLoadModule('@google/genai');
              const ai = new GoogleGenAI({ apiKey: agent.llm_api_key });
              const historyText = modelMessages
                .filter((m) => m.role !== 'system')
                .map((m) => `${m.role}: ${m.content}`)
                .join('\n');

              const r = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: historyText }] }],
                config: { systemInstruction: modelMessages.find((m) => m.role === 'system')?.content || agent.system_prompt }
              });
              responseText = r.text || 'No response';
            } else if (agent.llm_provider === 'openai') {
              const { default: OpenAI } = await server.ssrLoadModule('openai');
              const openai = new OpenAI({ apiKey: agent.llm_api_key });
              const c = await openai.chat.completions.create({
                messages: modelMessages,
                model: 'gpt-4o',
              });
              responseText = c.choices[0].message.content || 'No response';
            }

            db.addMessage(thread.id, 'assistant', responseText);
            const extracted = extractMemoriesFromText(text);
            for (const m of extracted) {
              db.upsertMemory(agent.id, chatIdStr, m.key, m.value, m.confidence, userMsg.id);
            }

            const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
            const bot = new TelegramBot(token, { polling: false });
            await bot.sendMessage(chatId, responseText);
            return;
          }

          next();
        } catch (err: any) {
          console.error('API error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [apiPlugin(), react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        buffer: 'buffer/',
      },
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
      watch: {
        ignored: ['**/.local/**', '**/.cache/**', '**/.git/**', '**/data/**', '**/.replit', '**/node_modules/**'],
      },
    },
  };
});
