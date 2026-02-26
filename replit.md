# LumiChan - Telegram AI Agent Platform

## Overview
A full-stack web application that lets users create and manage AI-powered Telegram bots. Users connect a crypto wallet, configure a Telegram bot token, choose an LLM provider (Gemini or OpenAI), and the platform handles webhook routing and message processing.

## Architecture

- **Runtime**: Node.js 20 with TypeScript (via `tsx`)
- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4
- **Backend**: Express.js serving both API routes and Vite middleware (unified server)
- **Database**: JSON file-based DB (`data/lumichan.json`)
- **Entry point**: `server.ts` — starts Express + Vite middleware together

## Project Structure

```
server.ts          # Express server + Vite dev middleware
src/
  main.tsx         # React entry point
  App.tsx          # Root component with routing
  pages/           # Route-level page components
  components/      # Shared UI components
  context/         # React context (WalletContext)
  db/index.ts      # JSON-based database abstraction
  layouts/         # Page layout wrappers
  lib/             # Utility functions
index.html         # Vite HTML template
vite.config.ts     # Vite config (host: 0.0.0.0, port: 5000)
```

## Key Configuration

- **Port**: 5000 (both frontend and backend via unified Express+Vite server)
- **Host**: `0.0.0.0` — required for Replit proxy
- **Dev command**: `npm run dev` (runs `tsx server.ts`)
- **Workflow**: "Start application" → `npm run dev` → port 5000 (webview)

## Environment Variables

- `GEMINI_API_KEY` — Google Gemini API key (optional, for Gemini LLM)
- `APP_URL` — Public URL for Telegram webhook setup (set in production)

## Features

- Wallet connection modal (Solana-style)
- Dashboard with agent management
- Create/configure AI agents backed by Telegram bots
- LLM providers: Gemini (`gemini-2.5-flash`) and OpenAI (`gpt-4o`)
- Telegram webhook handler (`/api/telegram/webhook/:token`)
- Transaction history, swap, and transfer pages

## Deployment

- Target: `vm` (always-running, needed for Telegram webhooks)
- Build: `npm run build` (Vite SPA build to `dist/`)
- Run: `node server.js` (production)
- Set `APP_URL` environment variable to the deployed URL for webhook setup
