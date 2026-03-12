# Nia Chat

`nia-chat` is a Next.js example for chatting about GitHub repos with a deployed `nia-agent-v2`.

Main idea:
- first index or resolve the selected repo with the Nia API on the Next.js side
- then let the agent analyze that repo using the Nia skill available inside the sandbox

The Nia skill and scripts live in `agents/nia-agent-v2/template/.claude/skills/nia/`. They are baked into the agent sandbox during deploy, so the agent sees them at runtime.

## Requirements

- Node.js 18+
- `API_KEY_21ST`
- `NIA_API_KEY`
- deployed `nia-agent-v2`

`NIA_API_KEY` must exist both:
- in `.env.local` for the Next.js server
- in the deployed sandbox environment for the bundled Nia skill/scripts

## Quick start

```bash
git clone https://github.com/21st-dev/an-examples.git
cd an-examples/nia-chat
cp .env.example .env.local
pnpm install
```

Set `API_KEY_21ST` and `NIA_API_KEY` in `.env.local`, then deploy and run:

```bash
npx @21st-sdk/cli login
npx @21st-sdk/cli deploy
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. `app/api/nia/source/route.ts` normalizes the repo and resolves or creates the Nia source.
2. `app/api/agent/sandbox/route.ts` creates a sandbox + thread for the chat session.
3. `app/page.tsx` connects chat with `createAgentChat(...)` using that sandbox/thread.

Sessions and messages are stored in `localStorage`.
