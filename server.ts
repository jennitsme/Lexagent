import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db/index.ts';
import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const app = express();
const PORT = 5000;

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
    
    const appUrl = process.env.APP_URL;
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
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      allowedHosts: 'all',
      hmr: false,
      watch: {
        ignored: ['**/.local/**', '**/.cache/**', '**/.git/**', '**/data/**', '**/.replit', '**/node_modules/**'],
      },
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
