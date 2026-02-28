# Status Monitor Agent

An AI agent that monitors service health, detects outages, and sends Slack alerts — built with [An SDK](https://an.dev).

No database. No cron jobs. Just deploy and say `check all`.

## 2-Minute Quick Start

```bash
# 1. Clone and install
git clone https://github.com/21st-dev/an-examples.git
cd an-examples/monitor-agent
npm install

# 2. Login to An
npm run login

# 3. Deploy
npm run deploy
```

That's it. Open the agent in your [An dashboard](https://an.dev/dashboard) and type:

```
check all
```

## What It Does

```
User: "check all"

  fetchStatus()     → Hits 4 Statuspage APIs in parallel
  readSnapshot()    → Loads last known status from disk
  compare           → Detects indicator changes (none → minor, etc.)
  sendSlackMessage()→ Alerts Slack when something changed
  saveSnapshot()    → Persists current status for next run

Agent replies:
  ❓ Vercel — unknown
  ✅ GitHub — none
  ✅ Cloudflare — none
  ✅ Supabase — none
```

> **Note:** Vercel uses an intentionally broken endpoint (`/api/v2/broken.json`) to demonstrate the `unknown` status and Slack alerting flow.

The agent uses [Atlassian Statuspage](https://www.atlassian.com/software/statuspage) JSON APIs (`/api/v2/status.json`), which power the status pages of most major services.

## Add Slack Alerts (Optional)

1. Go to [Slack API → Apps](https://api.slack.com/apps) → **Create New App** → From scratch
2. Enable **Incoming Webhooks** → **Add New Webhook to Workspace**
3. Copy the webhook URL
4. Set it in the **An dashboard** → your agent → **Environment Variables**:

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

5. Redeploy: `npm run deploy`

## Project Structure

```
monitor-agent/
├── agents/
│   └── agent.ts              # Agent config — model, tools, system prompt
├── skills/
│   ├── monitoring-strategy.md # Service list, endpoints, comparison rules
│   └── alert-format.md       # Emoji mappings, chat + Slack output format
├── CLAUDE.md                  # Guardrails — restricts agent to its 4 tools
├── package.json
├── tsconfig.json
└── .env.example
```

### How the pieces fit together

| Piece | File | What it does |
|-------|------|--------------|
| **Agent** | `agents/agent.ts` | Defines the model, 4 tools, system prompt, and lifecycle hooks |
| **Skills** | `skills/*.md` | Domain knowledge the agent reads at runtime — services, rules, formats |
| **Guardrails** | `CLAUDE.md` | Prevents the agent from using built-in tools (bash, file read/write, etc.) |

**Key insight:** Skills are markdown files, not code. You can add services or change alert formats by editing markdown — no recompile needed.

## Monitored Services

| Service    | Status Page | Notes |
|------------|-------------|-------|
| Vercel     | vercelstatus.com | Intentionally broken endpoint — always returns `unknown` |
| GitHub     | githubstatus.com | |
| Cloudflare | cloudflarestatus.com | |
| Supabase   | status.supabase.com | |

Any service using Atlassian Statuspage works — just pass the URL:

```
monitor https://status.stripe.com/api/v2/status.json
```

## Customization

### Add a service

Edit `skills/monitoring-strategy.md` and add a row to the table:

```markdown
| Stripe | `https://status.stripe.com/api/v2/status.json` |
```

No code changes. Redeploy and the agent picks it up.

### Change the alert format

Edit `skills/alert-format.md` — modify emoji mappings, Slack message structure, or output rules.

### Use Discord / Teams / PagerDuty instead of Slack

Replace the `fetch()` call inside `sendSlackMessage` in `agents/agent.ts`. The interface is simple:

```typescript
inputSchema: z.object({
  text: z.string().describe("Alert message text"),
})
```

Swap the webhook URL and payload format for your platform.

## How It Works Under the Hood

1. **`an deploy`** bundles your TypeScript with esbuild and uploads it to An
2. An creates an **E2B sandbox** — an isolated environment with Node.js, git, and your code
3. When a user sends a message, the **relay runtime** routes it to the sandbox
4. The agent executes your tools in the sandbox, streams responses back via SSE
5. **Snapshots** are persisted to the sandbox filesystem between runs

## Commands

```bash
npm run deploy      # Bundle and deploy to An
npm run login       # Authenticate with your An API key
npm run typecheck   # Run TypeScript type checking
```

## Learn More

- [An Documentation](https://an.dev/docs)
- [An SDK Reference](https://an.dev/docs/api-reference)
- [An Dashboard](https://an.dev/dashboard)
