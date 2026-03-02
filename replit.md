# Sendra - Telegram AI Agent & Solana Wallet Platform

## Overview
A full-stack web application for Solana blockchain interaction and Telegram AI agent management. Users connect their Phantom wallet, view real SOL balances, send SOL, swap tokens via Jupiter, view transaction history, and create AI-powered Telegram bots.

## Architecture

- **Runtime**: Node.js 20 with TypeScript
- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4
- **Backend**: API routes via Vite plugin (dev), Express server (production)
- **Database**: JSON file-based DB (`data/sendra.json`) for agent storage
- **Blockchain**: Solana mainnet-beta via `@solana/web3.js`
- **DEX**: Jupiter Lite API for token swaps

## Project Structure

```
vite.config.ts     # Vite config with API plugin for dev server
server.ts          # Express server for production
src/
  main.tsx         # React entry point (with Buffer polyfill)
  App.tsx          # Root component with routing
  pages/
    DashboardHome  # Real SOL balance, SOL price, recent transactions
    Transfer       # Private Transfer: send SOL to pool, generate claim codes
    Swap           # Jupiter-powered token swaps (SOL/USDC/USDT)
    History        # Real Solana transaction history
    CreateAgent    # Telegram bot deployment with LLM integration
    Settings       # Wallet info, disconnect, copy address
  components/      # Shared UI components (Navbar, Hero, Footer, etc.)
  context/
    WalletContext  # Phantom/MetaMask connection + signAndSendTransaction
  db/index.ts      # JSON-based database for agent storage
  lib/
    solana.ts      # Solana utilities (balance, transfers, history, price)
    utils.ts       # General utilities (cn)
  layouts/         # Dashboard layout wrapper
index.html         # Vite HTML template
public/logo.jpg    # Sendra logo
public/favicon.png # Sendra favicon
```

## Key Configuration

- **Port**: 5000 (Vite dev server)
- **Host**: `0.0.0.0` — required for Replit proxy
- **allowedHosts**: `true` (Vite 6 requires boolean, not string 'all')
- **Dev command**: `npm run dev` (runs `vite`)
- **Workflow**: "Start application" → `npm run dev` → port 5000 (webview)

## Solana Integration

- **RPC**: `https://solana-rpc.publicnode.com` (free public RPC, no API key needed)
- **Wallet**: Phantom browser extension via `window.solana` (MetaMask is detected but unsupported for Solana features — all pages show a clear message to connect Phantom instead)
- **Balance**: Real SOL balance via `getBalance()`
- **Transfers**: Private pool-based transfers with claim codes (Keypair-based escrow)
- **Direct Transfers**: `SystemProgram.transfer` signed by Phantom (available in solana.ts)
- **History**: `getSignaturesForAddress` with parsed transaction details
- **Price**: CoinGecko API for SOL/USD price
- **Swaps**: Jupiter Lite API (`lite-api.jup.ag/swap/v1`) Quote + Swap

## API Routes (via Vite plugin in dev)

- `GET /api/agents?walletAddress=...` — Get agents for a wallet
- `POST /api/agents` — Create/deploy a Telegram bot agent
- `POST /api/telegram/webhook/:token` — Telegram webhook handler

## Environment Variables

- `GEMINI_API_KEY` — Google Gemini API key (optional)
- `APP_URL` — Public URL for Telegram webhook setup (production)

## Dependencies

- `@solana/web3.js` — Solana blockchain interaction
- `buffer` — Buffer polyfill for browser
- `react-router-dom` — Client-side routing
- `motion` — Animation library
- `lucide-react` — Icon library
- `@google/genai`, `openai` — LLM providers for agents
- `node-telegram-bot-api` — Telegram bot API

## Deployment

- Target: `vm` (always-running for Telegram webhooks)
- Build: `npm run build` (Vite SPA build to `dist/`)
- Run: `node server.js` (production Express server)
