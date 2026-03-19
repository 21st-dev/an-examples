# Go Terminal Chat

Interactive terminal chat client for [21st Agents](https://21st.dev/agents), built with the [Go SDK](https://github.com/21st-dev/21st-sdk-go).

## How It Works

The app communicates with the 21st Agents relay API through three main concepts:

1. **Sandbox** — an isolated cloud environment where your agent runs. On startup, the app creates a sandbox for the specified agent.
2. **Thread** — a conversation within a sandbox. Each thread maintains its own message history. The app creates one thread per session.
3. **Streaming** — when you send a message, the app calls `threads.run()` which returns an SSE (Server-Sent Events) stream. The app parses incoming events in real time, printing text deltas as they arrive and displaying tool calls the agent makes.

The conversation history is managed server-side inside the sandbox. You can switch models on the fly with `/model`, and `/new` fully resets both sandbox and thread for a clean session.

## Prerequisites

- Go 1.21+
- A 21st.dev API key (`an_sk_...`)
- An agent slug (e.g. `your-org/your-agent`)

## Setup

1. Clone and enter the directory:

```bash
cd golang-terminal-chat
```

2. Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
API_KEY_21ST=an_sk_your_key_here
AGENT_SLUG=your-org/your-agent
```

3. Run:

```bash
go run .
```

## Commands

| Command | Description |
|---------|-------------|
| `/model <slug>` | Switch to a different model (e.g. `/model gpt-4o`) |
| `/model` | Show the current model |
| `/new` | Create a new sandbox and thread (full reset) |
| `/exit` | Quit the chat |

## Example Session

```
Connected to agent: your-org/your-agent
Sandbox: abc123
Thread: def456
Commands: /new (new thread) | /model <slug> (switch model) | /exit (quit)

you> Hello, what can you do?
assistant> I can help you with...
[meta] duration=1234ms | cost=$0.003

you> /model gpt-4o
[model] Switched to: gpt-4o

you> Now answer using GPT-4o
assistant> Sure, I'm now responding via GPT-4o...

you> /new
New sandbox: xyz789
New thread: uvw012

you> /exit
```
