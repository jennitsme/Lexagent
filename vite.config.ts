import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import type { Plugin, ViteDevServer } from 'vite';

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
            const appUrl = process.env.APP_URL;
            if (appUrl) {
              await bot.setWebHook(`${appUrl}/api/telegram/webhook/${telegramToken}`);
            }
            const result = db.createAgent({
              wallet_address: walletAddress, name,
              telegram_token: telegramToken, allowed_chat_id: allowedChatId,
              llm_provider: llmProvider, llm_api_key: llmApiKey,
              system_prompt: systemPrompt || "You are a helpful AI agent."
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, agentId: result.lastInsertRowid, botName: botInfo.username }));
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
              await bot.sendMessage(chatId, "Access denied.");
              return;
            }
            let responseText = "I'm sorry, I couldn't process that.";
            if (agent.llm_provider === 'gemini') {
              const { GoogleGenAI } = await server.ssrLoadModule('@google/genai');
              const ai = new GoogleGenAI({ apiKey: agent.llm_api_key });
              const r = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text }] }],
                config: { systemInstruction: agent.system_prompt }
              });
              responseText = r.text || "No response";
            } else if (agent.llm_provider === 'openai') {
              const { default: OpenAI } = await server.ssrLoadModule('openai');
              const openai = new OpenAI({ apiKey: agent.llm_api_key });
              const c = await openai.chat.completions.create({
                messages: [{ role: "system", content: agent.system_prompt }, { role: "user", content: text }],
                model: "gpt-4o",
              });
              responseText = c.choices[0].message.content || "No response";
            }
            const { default: TelegramBot } = await server.ssrLoadModule('node-telegram-bot-api');
            const bot = new TelegramBot(token, { polling: false });
            await bot.sendMessage(chatId, responseText);
            return;
          }

          next();
        } catch (err: any) {
          console.error("API error:", err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
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
