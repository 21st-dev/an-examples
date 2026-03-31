"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { createAgentChat, AgentChat } from "@21st-sdk/nextjs"
import { useSearchParams } from "next/navigation"
import type { Chat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import "@21st-sdk/react/styles.css"

const SANDBOX_STORAGE_KEY = "docs-assistant:sandboxId"

function ChatPanel({
  colorMode,
  sandboxId,
}: {
  colorMode: "light" | "dark"
  sandboxId: string
}) {
  const chat = useMemo(
    () =>
      createAgentChat({
        agent: "docs-assistant",
        tokenUrl: "/api/agent/token",
        sandboxId,
      }),
    [sandboxId],
  )

  const { messages, sendMessage, status, stop, error } = useChat({
    chat: chat as Chat<UIMessage>,
  })

  return (
    <AgentChat
      messages={messages}
      onSend={(msg) => sendMessage({ text: msg.content })}
      status={status}
      onStop={stop}
      error={error ?? undefined}
      colorMode={colorMode}
    />
  )
}

function DocsChat() {
  const searchParams = useSearchParams()
  const themeParam = searchParams.get("theme")
  const sidebarParam = searchParams.get("sidebar")
  const [colorMode, setColorMode] = useState<"light" | "dark">("dark")
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [sandboxError, setSandboxError] = useState<string | null>(null)

  useEffect(() => {
    if (themeParam === "light") {
      setColorMode("light")
      return
    }
    if (themeParam === "dark") {
      setColorMode("dark")
      return
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    setColorMode(mq.matches ? "dark" : "light")
    const handler = (e: MediaQueryListEvent) =>
      setColorMode(e.matches ? "dark" : "light")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [themeParam])

  useEffect(() => {
    let isMounted = true

    const initSandbox = async () => {
      try {
        let nextSandboxId = window.localStorage.getItem(SANDBOX_STORAGE_KEY)

        if (!nextSandboxId) {
          const res = await fetch("/api/agent/sandbox", { method: "POST" })
          const data = (await res.json()) as { sandboxId?: string; error?: string }

          if (!res.ok || !data.sandboxId) {
            throw new Error(data.error ?? "Failed to create sandbox")
          }

          nextSandboxId = data.sandboxId
          window.localStorage.setItem(SANDBOX_STORAGE_KEY, nextSandboxId)
        }

        if (isMounted) {
          setSandboxId(nextSandboxId)
        }
      } catch (error) {
        if (isMounted) {
          setSandboxError(
            error instanceof Error ? error.message : "Failed to initialize chat",
          )
        }
      }
    }

    void initSandbox()

    return () => {
      isMounted = false
    }
  }, [])

  const themeClass = colorMode === "dark" ? "dark" : ""

  return (
    <div
      className={`flex h-screen bg-background text-foreground ${themeClass}`}
    >
      <main className="flex flex-1 min-w-0 bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <div className="flex-1 h-full">
          {sandboxId ? (
            <ChatPanel colorMode={colorMode} sandboxId={sandboxId} />
          ) : (
            <div className="flex h-full items-center justify-center">
              {sandboxError ?? "Initializing docs assistant..."}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="h-screen flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <DocsChat />
    </Suspense>
  )
}
