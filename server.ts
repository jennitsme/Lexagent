import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './src/db/index.ts';
import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const distPath = path.join(__dirname, 'dist');
const isProd = fs.existsSync(path.join(distPath, 'index.html'));

app.use(express.json());

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

app.get('/api/agents', (req, res) => {
  const { walletAddress } = req.query;
  if (!walletAddress) return res.status(400).json({ error: 'Wallet address required' });
  const agents = db.getAgentsByWallet(walletAddress as string);
  res.json(agents);
});

app.post('/api/agents', async (req, res) => {
  const { walletAddress, name, telegramToken, allowedChatId, llmProvider, llmApiKey, systemPrompt } = req.body;

  if (!walletAddress || !name || !telegramToken || !llmProvider || !llmApiKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const bot = new TelegramBot(telegramToken, { polling: false });
    const botInfo = await bot.getMe();

    const appUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null);
    if (appUrl) {
      const webhookUrl = `${appUrl}/api/telegram/webhook/${telegramToken}`;
      console.log(`Setting webhook to: ${webhookUrl}`);
      await bot.setWebHook(webhookUrl);
    } else {
      console.warn('APP_URL not set, skipping webhook setup.');
    }

    const result = db.createAgent({
      wallet_address: walletAddress,
      name,
      telegram_token: telegramToken,
      allowed_chat_id: allowedChatId,
      llm_provider: llmProvider,
      llm_api_key: llmApiKey,
      system_prompt: systemPrompt || 'You are a helpful AI agent.'
    });

    res.json({ success: true, agentId: result.lastInsertRowid, botName: botInfo.username });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message || 'Failed to create agent' });
  }
});

app.post('/api/agent-chat', async (req, res) => {
  const { message } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured on server',
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You are a wallet transaction interpreter. Convert user chat into JSON only. JSON schema: {"intent":"send_sol"|"chat", "amountSol":number|null, "toAddress":string|null, "reply":string}. If user clearly asks to send SOL and includes amount + destination wallet, set intent=send_sol. Otherwise intent=chat and give helpful reply. Output must be pure JSON without markdown.'
        },
        { role: 'user', content: message },
      ],
    });

    const raw = completion.choices[0].message.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (!parsed || typeof parsed !== 'object') {
      return res.status(200).json({
        intent: 'chat',
        amountSol: null,
        toAddress: null,
        reply: "I couldn't parse that. Try: send 0.1 SOL to <wallet_address>",
      });
    }

    return res.json({
      intent: parsed.intent === 'send_sol' ? 'send_sol' : 'chat',
      amountSol: typeof parsed.amountSol === 'number' ? parsed.amountSol : null,
      toAddress: typeof parsed.toAddress === 'string' ? parsed.toAddress : null,
      reply: typeof parsed.reply === 'string' ? parsed.reply : 'Okay.',
    });
  } catch (error: any) {
    console.error('Agent chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process message' });
  }
});

app.get('/api/threads', (req, res) => {
  const agentId = req.query.agentId ? Number(req.query.agentId) : undefined;
  const chatId = req.query.chatId ? String(req.query.chatId) : undefined;
  if (!agentId && !chatId) {
    return res.status(400).json({ error: 'agentId or chatId is required' });
  }
  const threads = db.getThreads(agentId, chatId);
  res.json(threads);
});

app.get('/api/threads/:id/messages', (req, res) => {
  const threadId = Number(req.params.id);
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  if (!threadId) return res.status(400).json({ error: 'Invalid thread id' });
  const messages = db.getMessagesByThread(threadId, limit);
  res.json(messages);
});

app.post('/api/threads/:id/reset', (req, res) => {
  const threadId = Number(req.params.id);
  if (!threadId) return res.status(400).json({ error: 'Invalid thread id' });
  const result = db.resetThread(threadId);
  res.json(result);
});

app.get('/api/memories', (req, res) => {
  const agentId = Number(req.query.agentId);
  const chatId = String(req.query.chatId || '');
  if (!agentId || !chatId) return res.status(400).json({ error: 'agentId and chatId are required' });
  const memories = db.getMemories(agentId, chatId, 50);
  res.json(memories);
});

app.delete('/api/memories/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid memory id' });
  const result = db.deleteMemory(id);
  res.json(result);
});

app.post('/api/telegram/webhook/:token', async (req, res) => {
  const { token } = req.params;
  const update = req.body;

  res.sendStatus(200);

  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text;

  try {
    const agent = db.getAgentByToken(token);

    if (!agent) {
      console.error(`No agent found for token: ${token}`);
      return;
    }

    if (agent.allowed_chat_id && agent.allowed_chat_id.toString() !== chatId.toString()) {
      const bot = new TelegramBot(token, { polling: false });
      await bot.sendMessage(chatId, 'Access denied: You are not the authorized user for this agent.');
      return;
    }

    const chatIdStr = String(chatId);

    if (text.trim().toLowerCase() === '/newthread') {
      const newThread = db.getOrCreateThread(
        agent.id,
        chatIdStr,
        update.message.chat.title || update.message.from?.first_name || `Chat ${chatId}`,
        true
      );
      const bot = new TelegramBot(token, { polling: false });
      await bot.sendMessage(chatId, `Started a new thread. Context reset. (thread: ${newThread.id})`);
      return;
    }

    if (text.trim().toLowerCase() === '/memory') {
      const memories = db.getMemories(agent.id, chatIdStr, 20);
      const lines = memories.length
        ? memories.map((m: any) => `- ${m.key}: ${m.value}`).join('\n')
        : 'No memory stored yet.';
      const bot = new TelegramBot(token, { polling: false });
      await bot.sendMessage(chatId, `Current memory:\n${lines}`);
      return;
    }

    if (text.trim().toLowerCase().startsWith('/forget ')) {
      const key = text.trim().slice('/forget '.length).trim();
      const result = db.deleteMemoryByKey(agent.id, chatIdStr, key);
      const bot = new TelegramBot(token, { polling: false });
      await bot.sendMessage(chatId, result.success ? `Forgot memory key: ${key}` : `No memory found for key: ${key}`);
      return;
    }

    const thread = db.getOrCreateThread(agent.id, chatIdStr, update.message.chat.title || update.message.from?.first_name || `Chat ${chatId}`);
    const userMsg = db.addMessage(thread.id, 'user', text);
    const recentMessages = db.getMessagesByThread(thread.id, 12).slice(-10);
    const memories = db.getMemories(agent.id, chatIdStr, 10);

    const modelMessages = buildModelMessages(
      agent.system_prompt,
      memories.map((m) => ({ key: m.key, value: m.value })),
      recentMessages.filter((m) => m.id !== userMsg.id).map((m) => ({ role: m.role, content: m.content })),
      text
    );

    let responseText = "I'm sorry, I couldn't process that.";

    if (agent.llm_provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: agent.llm_api_key });
      const historyText = modelMessages
        .filter((m) => m.role !== 'system')
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: historyText }] }],
        config: {
          systemInstruction: modelMessages.find((m) => m.role === 'system')?.content || agent.system_prompt
        }
      });
      responseText = result.text || 'No response';
    } else if (agent.llm_provider === 'openai') {
      const openai = new OpenAI({ apiKey: agent.llm_api_key });
      const completion = await openai.chat.completions.create({
        messages: modelMessages,
        model: 'gpt-4o',
      });
      responseText = completion.choices[0].message.content || 'No response';
    }

    db.addMessage(thread.id, 'assistant', responseText);

    const extracted = extractMemoriesFromText(text);
    for (const m of extracted) {
      db.upsertMemory(agent.id, chatIdStr, m.key, m.value, m.confidence, userMsg.id);
    }

    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, responseText);

  } catch (error) {
    console.error('Error processing webhook:', error);
    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, 'Error processing your request.');
  }
});

async function startServer() {
  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: false,
        watch: {
          ignored: ['**/.local/**', '**/.cache/**', '**/.git/**', '**/data/**', '**/.replit', '**/node_modules/**'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);

    const appUrl = process.env.APP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : null);
    if (appUrl) {
      console.log(`App URL: ${appUrl}`);
      try {
        const agents = db.getAllAgents();
        for (const agent of agents) {
          try {
            const bot = new TelegramBot(agent.telegram_token, { polling: false });
            const webhookUrl = `${appUrl}/api/telegram/webhook/${agent.telegram_token}`;
            await bot.setWebHook(webhookUrl);
            console.log(`Webhook registered for agent "${agent.name}": ${webhookUrl}`);
          } catch (err: any) {
            console.error(`Failed to register webhook for agent "${agent.name}":`, err.message);
          }
        }
        if (agents.length === 0) {
          console.log('No agents found to register webhooks for.');
        }
      } catch (err: any) {
        console.error('Failed to re-register webhooks:', err.message);
      }
    } else {
      console.warn('APP_URL and REPLIT_DOMAINS not set — webhooks cannot be registered.');
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
