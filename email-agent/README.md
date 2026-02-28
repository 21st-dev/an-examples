# AN SDK — Email Agent Boilerplate

Next.js + AN + AgentMail starter for:
- Sending intro emails
- Reading inbox messages
- Auto-replying to inbound emails

## Project structure

```
email-agent/
├── agents/
│   ├── email-agent.ts          # Agent config (prompt, model, tool wiring)
│   ├── tools.ts                # Tool schemas + execution orchestration
│   ├── env.ts                  # Env loading (local + sandbox) and validation
│   └── agentmail.ts            # AgentMail API client helpers
├── app/
│   ├── api/an/token/route.ts   # Server token exchange (AN_API_KEY stays server-side)
│   ├── page.tsx                # Chat UI + quick prompts panel
│   ├── layout.tsx
│   └── globals.css
├── .env.example
└── package.json
```

## Quick start

### 1) Install and deploy the agent

```bash
npm install
npm run login
npm run deploy
```

### 2) Configure environment

```bash
cp .env.example .env.local
```

Fill values in `.env.local`:
- `AN_API_KEY` - your `an_sk_` key
- `AGENTMAIL_API_KEY` - AgentMail API key
- `AGENTMAIL_INBOX_ID` - your sender inbox ID

### 3) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Tool contracts

### `send_intro_email`
Input fields:
- `to` (email)
- `subject` (string)
- `text` (string)
- `html` (optional string)

### `read_inbox`
Input fields:
- `limit` (optional number, 1-50)

### `auto_reply`
Input fields:
- `text` (string)
- `html` (optional string)
- `messageId` (optional string)
- `replyAll` (optional boolean)

## Commands

```bash
npm run dev
npm run build
npm run start
npm run login
npm run deploy
npm run typecheck
```

## Customize

- Agent behavior and prompt: `agents/email-agent.ts`
- Tool schemas and logic: `agents/tools.ts`
- AgentMail API adapter: `agents/agentmail.ts`
- Environment loading/validation: `agents/env.ts`
- UI: `app/page.tsx`

## Requirements

- Keep `AN_API_KEY` server-side in `app/api/an/token/route.ts`
- Use a valid AgentMail inbox for `AGENTMAIL_INBOX_ID`
