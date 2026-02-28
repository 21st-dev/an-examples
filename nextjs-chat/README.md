# An SDK — Next.js Chat Example

Full-stack example: deploy a Claude Code agent and connect it to a chat UI.

```
nextjs-chat/
├── agents/
│   └── my-agent.ts            # Agent definition (deploy this)
├── app/
│   ├── api/an/
│   │   ├── sandbox/route.ts   # Creates/caches agent sandboxes
│   │   ├── threads/route.ts   # Creates/lists chat threads
│   │   └── token/route.ts     # Token handler (server-side)
│   ├── page.tsx               # Chat UI (client-side)
│   ├── layout.tsx
│   └── globals.css
├── .env.example
└── package.json
```

## Setup

### 1. Deploy the agent

```bash
npm install
npx an login          # paste your an_sk_ API key
npx an deploy         # deploys an/agent.ts to An cloud
```

### 2. Run the app

```bash
cp .env.example .env.local
# Edit .env.local — add your AN_API_KEY

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

**Agent** (`agents/my-agent.ts`) — defines what the agent can do. Uses Claude Sonnet with a custom `search_docs` tool. Deployed to An cloud with `an deploy`.

**Token handler** (`app/api/an/token/route.ts`) — exchanges your server-side `an_sk_` key for a short-lived JWT. The client never sees your API key.

**Chat UI** (`app/page.tsx`) — uses `createAnChat()` to connect to the deployed agent via the relay, and `<AnAgentChat>` to render the full chat interface with tool call visualization.

## What you'll see

- Real-time streaming of Claude's responses
- Tool calls rendered live (Bash, Read, Write, Edit, Grep, etc.)
- File diffs, search results, and terminal output
- The custom `search_docs` tool fetching web results
