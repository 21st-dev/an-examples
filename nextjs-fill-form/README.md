# AN SDK — Next.js Fill Form Example

Minimal full-stack example: a tabbed form UI on the left and AN chat on the right.

```
nextjs-fill-form/
├── agents/
│   └── my-agent.ts            # Agent definition with fill_form tool
├── app/
│   ├── api/an/token/route.ts  # Token handler (server-side)
│   ├── page.tsx               # Tabs + forms + chat integration
│   ├── layout.tsx
│   └── globals.css
├── .env.example
└── package.json
```

## Setup

### 1. Deploy the agent

```bash
npm install
npx an login
npx an deploy
```

### 2. Run the app

```bash
cp .env.example .env.local
# Add AN_API_KEY to .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How context is passed

When you send a chat message, the app prepends a hidden context block:

`[[[SYSTEM NOTE: CURRENTLY USER IS WORKING WITH THE FORM "<formId>" ... CURRENT FORM DATA: ... FORM SCHEMA AGAIN: ... ]]]`

This helps the model fill the current tab without requiring the user to name the form every time.

The prefix is only sent to the model. It is stripped from rendered user messages in the chat UI.

## Tool contract

Tool name: `fill_form`

Input is a discriminated union by `formId`:
- `profile` patch
- `order` patch
- `support` patch

Tool output is JSON text:

```json
{"formId":"profile","patch":{"fullName":"Jane Doe"}}
```

Client behavior:
- Parse latest `tool-fill_form` output when part state is `output-available`
- Apply once per `toolCallId`
- Ignore updates where `formId !== activeTab`
- Merge only recognized fields for that form

## Sample prompts

- `fill this form with my name Jane Doe, email jane@example.com, age 29`
- `set quantity to 3 and add note rush delivery`
- `set support priority high and contact method email`
