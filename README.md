# An SDK Examples

Example projects for the [An SDK](https://an.dev) — deploy AI coding agents and connect them to your app.

## Examples

| Example | Description | Stack |
|---------|-------------|-------|
| [`nextjs-chat`](./nextjs-chat) | Chat UI connected to a deployed agent with web search | Next.js, @an-sdk |
| [`nextjs-fill-form`](./nextjs-fill-form) | AI-powered form filling with tabbed forms + chat | Next.js, React Hook Form, @an-sdk |
| [`email-agent`](./email-agent) | Email operations copilot — send, read inbox, auto-reply via AgentMail | Next.js, AgentMail, @an-sdk |
| [`note-taker`](./note-taker) | AI notebook assistant with persistent notes via Convex | Next.js, Convex, @an-sdk |
| [`monitor-agent`](./monitor-agent) | Service health monitoring with Slack alerts | Node.js CLI, @an-sdk |

## Quick Start

Each example is self-contained. Pick one, navigate to its directory, and follow its README:

```bash
cd nextjs-chat
pnpm install
npx an login
npx an deploy
cp .env.example .env.local
pnpm dev
```

## Links

- [an.dev](https://an.dev)
- [An Documentation](https://an.dev/docs)
- [@an-sdk/agent](https://www.npmjs.com/package/@an-sdk/agent)
- [@an-sdk/react](https://www.npmjs.com/package/@an-sdk/react)
- [@an-sdk/nextjs](https://www.npmjs.com/package/@an-sdk/nextjs)
- [@an-sdk/cli](https://www.npmjs.com/package/@an-sdk/cli)
