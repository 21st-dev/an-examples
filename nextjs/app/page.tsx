"use client"

import { useChat } from "@ai-sdk/react"
import { createAnChat, AnAgentChat } from "@an-sdk/nextjs"
import "@an-sdk/react/styles.css"

const chat = createAnChat({
  agent: "my-agent",
  tokenUrl: "/api/an/token",
})

export default function Home() {
  const { messages, sendMessage, status, stop, error } = useChat({ chat })

  return (
    <main className="h-screen">
      <AnAgentChat
        messages={messages}
        onSend={(msg) => sendMessage({ text: msg.content })}
        status={status}
        onStop={stop}
        error={error ?? undefined}
      />
    </main>
  )
}
