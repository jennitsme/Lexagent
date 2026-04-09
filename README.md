# Lexagent ⚡

**Telegram-native AI agents with wallet-connected Solana execution.**

Lexagent is a full-stack app where users can:
- deploy custom AI agents to Telegram,
- run natural-language transfer commands,
- manage Solana activity from a dashboard (balance, transfer, swap, history).

---

## Why Lexagent

Most crypto workflows are still manual: open wallet, copy address, switch tab, confirm, repeat.

Lexagent reduces that friction by combining:
- **LLM-driven intent parsing** (chat → structured action),
- **Telegram bot automation**,
- **wallet-signed Solana execution** (user still controls final signature).

---

## Core Capabilities

### 1) Agent Factory (Telegram AI Agent Deployment)
Create per-wallet Telegram agents with:
- custom bot token,
- custom system prompt,
- selectable LLM provider (Gemini / OpenAI; Anthropic option is present in UI).

### 2) Agent Transfer Chat (Natural Language → SOL Transfer)
Users type commands like:

```txt
send 0.1 SOL to <wallet_address>
```

Backend parses the message into strict JSON intent, then frontend prepares a Solana transaction for wallet signature.

### 3) Solana Dashboard
- live SOL balance,
- SOL/USD price,
- recent on-chain activity,
- explorer links.

### 4) Private Transfer via Claim Code
Send SOL to a temporary pool and share a claim code with recipient.

### 5) Swap (Jupiter Lite API)
Token swap flow for SOL / USDC / USDT via Jupiter quote + swap APIs.

---

## Product Flow (How It Works)

### A. Deploying a Telegram Agent
1. User connects wallet.
2. User submits agent config (`name`, `telegramToken`, `llmProvider`, `llmApiKey`, `systemPrompt`, optional `allowedChatId`).
3. `POST /api/agents` validates bot token via Telegram `getMe()`.
4. Server sets bot webhook to `/api/telegram/webhook/:token`.
5. Agent config is persisted to JSON DB (`data/lexagent.json`).

### B. Telegram Runtime
1. Telegram sends incoming message to webhook endpoint.
2. Server resolves agent from token.
3. Optional chat restriction via `allowed_chat_id`.
4. Message is forwarded to configured LLM provider.
5. Model output is sent back to Telegram chat.

### C. Agent Transfer Chat Runtime
1. User sends natural-language command in app (`/dashboard/agent-transfer`).
2. Frontend calls `POST /api/agent-chat`.
3. OpenAI model returns strict JSON schema:
   - `intent`: `send_sol | chat`
   - `amountSol`
   - `toAddress`
   - `reply`
4. If `intent=send_sol`, app builds transaction and requests Phantom signature.
5. Signed transaction is submitted to Solana.

---

## Architecture Diagram

```mermaid
flowchart TD
    U[Web User] --> FE[React + Vite Frontend]

    FE -->|POST /api/agents| API[Express/Vite API Layer]
    FE -->|POST /api/agent-chat| API

    API --> DB[(data/lexagent.json)]
    API --> TG[Telegram Bot API]
    TG -->|Webhook Update| API

    API --> LLM[Gemini / OpenAI]

    FE -->|Create + Sign Tx| W[Phantom Wallet]
    W --> SOL[(Solana Mainnet)]

    FE --> JUP[Jupiter Lite API]
    JUP --> FE
```

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- Motion + Lucide icons

### Backend
- Express (`server.ts`)
- Vite middleware API plugin for dev (`vite.config.ts`)
- Node Telegram Bot API

### Blockchain / Infra
- `@solana/web3.js`
- Phantom wallet integration
- Jupiter Lite API for swaps
- CoinGecko for SOL price

### Data
- Local JSON storage (`data/lexagent.json`)

---

## Repository Structure

```text
Lexagent/
├─ api/
│  └─ agent-chat.ts                # Serverless-style route variant
├─ src/
│  ├─ components/                  # Landing + shared UI components
│  ├─ context/WalletContext.tsx    # Wallet connect + sign/send abstraction
│  ├─ db/index.ts                  # JSON DB adapter
│  ├─ lib/solana.ts                # Solana ops (balance, tx, pool claim, etc.)
│  ├─ layouts/DashboardLayout.tsx
│  ├─ pages/
│  │  ├─ DashboardHome.tsx
│  │  ├─ Transfer.tsx
│  │  ├─ Swap.tsx
│  │  ├─ History.tsx
│  │  ├─ Settings.tsx
│  │  ├─ CreateAgent.tsx
│  │  └─ AgentTransferChat.tsx
│  └─ App.tsx
├─ server.ts                       # Production server
├─ vite.config.ts                  # Vite + dev API middleware
├─ proxy-dev.cjs                   # Local proxy helper
├─ .env.example
└─ package.json
```

---

## API Reference

### `GET /api/agents?walletAddress=<address>`
Returns all agents linked to a wallet.

### `POST /api/agents`
Creates a new Telegram agent and registers webhook.

Example:

```json
{
  "walletAddress": "<wallet>",
  "name": "LexagentBot_01",
  "telegramToken": "123456:ABC...",
  "allowedChatId": "123456789",
  "llmProvider": "gemini",
  "llmApiKey": "<provider-key>",
  "systemPrompt": "You are a helpful AI agent"
}
```

### `POST /api/telegram/webhook/:token`
Telegram webhook receiver for deployed agents.

### `POST /api/agent-chat`
Converts natural language into transfer/chat intent.

Example:

```json
{
  "message": "send 0.1 SOL to <wallet_address>"
}
```

---

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required / commonly used:

- `OPENAI_API_KEY` — required for `/api/agent-chat`
- `APP_URL` — public app URL for webhook registration
- `GEMINI_API_KEY` — required when using Gemini-based provider flow

---

## Local Development

```bash
npm install
npm run dev
```

Type-check:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

---

## Current Limitations

- Secrets (`telegram_token`, `llm_api_key`) are currently stored in local JSON (plaintext).
- Webhook endpoint uses token in URL path.
- Wallet ownership verification for agent creation is not yet challenge-signature based.
- Some transitive dependencies in Telegram chain are outdated.

---

## Production Hardening Recommendations

1. Move credentials to Secret Manager / KMS.
2. Add wallet signature auth (`nonce + verify`) for agent creation APIs.
3. Replace token-based webhook path with internal agent ID + signed request verification.
4. Add request rate limiting + structured log redaction.
5. Upgrade vulnerable dependencies and enforce CI security checks.

---

## Roadmap (Suggested)

- [ ] Authenticated agent ownership proof (wallet signature)
- [ ] Encrypted credential storage
- [ ] Provider parity (Anthropic backend path)
- [ ] Multi-chain architecture abstraction
- [ ] Team/organization-level agent management
- [ ] Observability (metrics, traces, structured logs)

---

## License

Not specified yet. Add a `LICENSE` file for your preferred model.
