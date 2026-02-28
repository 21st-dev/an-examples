"use client"

import { useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { AnAgentChat, createAnChat } from "@an-sdk/nextjs"
import "@an-sdk/react/styles.css"

const chat = createAnChat({
  agent: "email-agent",
  tokenUrl: "/api/an/token",
})

export default function Home() {
  const { messages, sendMessage, status, stop, error } = useChat({ chat })
  const starterPrompts = useMemo(
    () => [
      "Send intro email to founder@acme.com about our AI QA tool.",
      "Check the latest 5 inbox messages and summarize replies.",
      "Auto-reply to the latest inbound with a friendly meeting follow-up.",
    ],
    [],
  )

  return (
    <main className="h-screen grid grid-cols-[340px_minmax(0,1fr)] bg-neutral-950 text-neutral-100">
      <aside className="border-r border-neutral-800 p-4 overflow-y-auto">
        <h1 className="text-lg font-semibold">Email Agent Boilerplate</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Hackathon template for outbound + inbox workflows with AN + AgentMail.
        </p>

        <section className="mt-6 space-y-2">
          <h2 className="text-xs uppercase tracking-wide text-neutral-500">Quick prompts</h2>
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage({ text: prompt })}
              className="w-full text-left rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm hover:border-neutral-700"
            >
              {prompt}
            </button>
          ))}
        </section>

        <section className="mt-6 rounded-md border border-neutral-800 bg-neutral-900 p-3">
          <h2 className="text-xs uppercase tracking-wide text-neutral-500">Capabilities</h2>
          <ul className="mt-2 space-y-1 text-sm text-neutral-300">
            <li>- Draft and send intro emails</li>
            <li>- Read recent inbox messages</li>
            <li>- Auto-reply to inbound threads</li>
          </ul>
        </section>
      </aside>

      <AnAgentChat
        messages={messages}
        onSend={(msg) => sendMessage({ text: msg.content })}
        status={status}
        onStop={stop}
        error={error ?? undefined}
        colorMode="dark"
        className="h-full"
      />
    </main>
  )
}
