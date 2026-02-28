# Note Taker Agent

An AI notebook assistant that saves, searches, updates, and deletes notes — built with [An SDK](https://an.dev) and [Convex](https://convex.dev).

Chat naturally. Notes persist across sessions in Convex.

## 5-Minute Quick Start

```bash
# 1. Clone and install
git clone https://github.com/21st-dev/an-examples.git
cd an-examples/note-taker
npm install

# 2. Set up Convex
npx convex dev
# Copy the deployment URL when prompted

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local:
#   AN_API_KEY=an_sk_your_key
#   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
#   CONVEX_URL=https://your-project.convex.cloud

# 4. Login to An and deploy the agent
npm run login
npm run deploy

# 5. Set CONVEX_URL in An dashboard env vars
# An dashboard -> your agent -> Environment Variables
# Add: CONVEX_URL=https://your-project.convex.cloud

# 6. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What It Does

```
You: "Remember that project Alpha demo is Tuesday at 2pm"
Agent: Saved "Project Alpha Demo" with tags: deadline, meeting

You: "What are my upcoming deadlines?"
Agent: Project Alpha Demo — Tuesday at 2pm

You: "Update the deadline to Wednesday"
Agent: Updated "Project Alpha Demo" — deadline changed to Wednesday

You: "Delete the note about Alpha"
Agent: Deleted "Project Alpha Demo"
```

## Project Structure

```
note-taker/
├── agents/
│   ├── note-taker.ts       # Agent config (prompt, model, tool wiring)
│   └── lib/
│       ├── tools.ts         # 6 note CRUD tools with Zod schemas
│       ├── convex.ts        # Convex HTTP client helpers
│       └── env.ts           # Env loading (local + sandbox)
├── skills/
│   ├── note-management.md   # Behavior rules, tag taxonomy
│   └── response-format.md   # Output formatting rules
├── app/
│   ├── api/
│   │   ├── an/token/route.ts    # Token exchange (API key stays server-side)
│   │   ├── an/sandbox/route.ts  # Sandbox creation/caching
│   │   ├── an/threads/route.ts  # Thread management
│   │   └── notes/route.ts       # REST API for notes (optional)
│   ├── components/
│   │   ├── thread-sidebar.tsx    # Thread navigation
│   │   ├── notes-panel.tsx       # Real-time notes display (Convex subscriptions)
│   │   └── note-tool-renderers.tsx  # Custom tool call visualization
│   ├── page.tsx             # Main layout: sidebar + chat + notes panel
│   ├── layout.tsx
│   ├── convex-provider.tsx  # Convex React provider
│   └── globals.css
├── convex/
│   ├── schema.ts            # Database schema (notes table)
│   └── notes.ts             # Queries and mutations
├── CLAUDE.md                # Agent guardrails
├── .env.example
└── package.json
```

## How The Pieces Fit Together

| Piece | File | What it does |
|-------|------|--------------|
| **Agent** | `agents/note-taker.ts` | Defines model, tools, system prompt, lifecycle hooks |
| **Tools** | `agents/lib/tools.ts` | 6 note CRUD tools with Zod schemas |
| **Skills** | `skills/*.md` | Domain knowledge — behavior rules and formatting |
| **Guardrails** | `CLAUDE.md` | Restricts agent to its 6 custom tools |
| **Convex** | `convex/` | Database schema and server functions |
| **UI** | `app/page.tsx` | Three-panel layout: threads + chat + notes |

Skills are markdown files, not code. Change how the agent categorizes notes or formats responses by editing markdown — no recompile needed.

## Customization

### Add a new tool

1. Define the tool in `agents/lib/tools.ts` with a Zod schema
2. Add a custom renderer in `app/components/note-tool-renderers.tsx`
3. Wire the renderer in `app/page.tsx` `toolRenderers` prop
4. Redeploy: `npm run deploy`

### Change note categories/tags

Edit `skills/note-management.md` — update the tag taxonomy table.

### Add a new Convex field

1. Update `convex/schema.ts`
2. Update `convex/notes.ts` queries/mutations
3. Update the `ConvexNote` interface in `agents/lib/tools.ts`
4. Run `npx convex dev` to push schema changes

### Change the UI layout

Edit `app/page.tsx`. The three-panel layout uses Tailwind flex:
- Thread sidebar: `w-56`
- Chat: `flex-1`
- Notes panel: `w-80`

## Commands

```bash
npm run dev          # Run Next.js + Convex dev servers
npm run dev:next     # Run Next.js only
npm run dev:convex   # Run Convex only
npm run build        # Production build
npm run login        # Authenticate with An
npm run deploy       # Deploy agent to An
npm run typecheck    # TypeScript type checking
```

## Learn More

- [An Documentation](https://an.dev/docs)
- [An SDK Reference](https://an.dev/docs/api-reference)
- [Convex Documentation](https://docs.convex.dev)
- [An Dashboard](https://an.dev/dashboard)
