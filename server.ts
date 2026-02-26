import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db/index.ts';
import TelegramBot from 'node-telegram-bot-api';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
// import Anthropic from 'anthropic';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- API Routes ---

// Get agents for a wallet
app.get('/api/agents', (req, res) => {
  const { walletAddress } = req.query;
  if (!walletAddress) return res.status(400).json({ error: 'Wallet address required' });
  
  // const agents = db.prepare('SELECT * FROM agents WHERE wallet_address = ?').all(walletAddress);
  const agents = db.getAgentsByWallet(walletAddress as string);
  res.json(agents);
});

// Create/Update Agent
app.post('/api/agents', async (req, res) => {
  const { walletAddress, name, telegramToken, allowedChatId, llmProvider, llmApiKey, systemPrompt } = req.body;
  
  if (!walletAddress || !name || !telegramToken || !llmProvider || !llmApiKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Verify Telegram Token by getting bot info
    const bot = new TelegramBot(telegramToken, { polling: false });
    const botInfo = await bot.getMe();
    
    // 2. Set Webhook
    // We use the APP_URL env var injected by the platform
    const appUrl = process.env.APP_URL;
    if (appUrl) {
      const webhookUrl = `${appUrl}/api/telegram/webhook/${telegramToken}`;
      console.log(`Setting webhook to: ${webhookUrl}`);
      await bot.setWebHook(webhookUrl);
    } else {
      console.warn("APP_URL not set, skipping webhook setup. Bot might not receive messages.");
    }

    // 3. Save to DB
    /*
    const stmt = db.prepare(`
      INSERT INTO agents (wallet_address, name, telegram_token, allowed_chat_id, llm_provider, llm_api_key, system_prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(walletAddress, name, telegramToken, allowedChatId, llmProvider, llmApiKey, systemPrompt || "You are a helpful AI agent.");
    */
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

// Telegram Webhook Handler
app.post('/api/telegram/webhook/:token', async (req, res) => {
  const { token } = req.params;
  const update = req.body;
  
  // Respond immediately to Telegram to avoid timeouts
  res.sendStatus(200);

  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text;

  try {
    // 1. Find agent by token
    // const agent = db.prepare('SELECT * FROM agents WHERE telegram_token = ?').get(token) as any;
    const agent = db.getAgentByToken(token);
    
    if (!agent) {
      console.error(`No agent found for token: ${token}`);
      return;
    }

    // 2. Check Allowed Chat ID (if set)
    if (agent.allowed_chat_id && agent.allowed_chat_id.toString() !== chatId.toString()) {
      const bot = new TelegramBot(token, { polling: false });
      await bot.sendMessage(chatId, "Access denied: You are not the authorized user for this agent.");
      return;
    }

    // 3. Call LLM
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
    /* } else if (agent.llm_provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey: agent.llm_api_key });
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: agent.system_prompt,
        messages: [{ role: "user", content: text }],
      });
      // @ts-ignore
      responseText = msg.content[0].text;
    } */

    // 4. Send Response back to Telegram
    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, responseText);

  } catch (error) {
    console.error("Error processing webhook:", error);
    const bot = new TelegramBot(token, { polling: false });
    await bot.sendMessage(chatId, "Error processing your request.");
  }
});


// --- Vite Middleware ---
async function startServer() {
  console.log("Starting server...");
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Initializing Vite middleware...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log("Vite middleware initialized.");
    } else {
      // Production static file serving would go here
      // app.use(express.static('dist'));
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
