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
      console.warn("APP_URL not set, skipping webhook setup.");
    }

    const result = db.createAgent({
      wallet_address: walletAddress,
      name,
      telegram_token: telegramToken,
      allowed_chat_id: allowedChatId,
      llm_provider: llmProvider,
      llm_api_key: llmApiKey,
      system_prompt: systemPrompt || "You are a helpful AI agent."
    });
    
    res.json({ success: true, agentId: result.lastInsertRowid, botName: botInfo.username });
  } catch (error: any) {
    console.error("Error creating agent:", error);
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
      await bot.sendMessage(chatId, "Access denied: You are not the authorized user for this agent.");
      return;
    }

    let responseText = "I'm sorry, I couldn't process that.";

    if (agent.llm_provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey: agent.llm_api_key });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: agent.system_prompt
        }
      });
      responseText = result.text || "No response";
    } else if (agent.llm_provider === 'openai') {
      const openai = new OpenAI({ apiKey: agent.llm_api_key });
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: agent.system_prompt },
          { role: "user", content: text }
        ],
        model: "gpt-4o",
      });
      responseText = completion.choices[0].message.content || "No response";
    }

    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, responseText);

  } catch (error) {
    console.error("Error processing webhook:", error);
    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, "Error processing your request.");
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
  console.error("Failed to start:", err);
  process.exit(1);
});
