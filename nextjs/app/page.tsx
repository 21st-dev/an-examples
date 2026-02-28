"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { createAnChat, AnAgentChat } from "@an-sdk/nextjs"
import type { CustomToolRendererProps } from "@an-sdk/react"
import type { Chat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import type { ThreadItem } from "./types"
import { ThreadSidebar } from "./components/thread-sidebar"
import "@an-sdk/react/styles.css"

function TestToolRenderer({ name, status, output }: CustomToolRendererProps) {
  return (
    <div style={{ padding: "8px 12px", background: "#1a1a2e", borderRadius: 8, fontSize: 13 }}>
      <div style={{ color: "#f59e0b", fontWeight: "bold", marginBottom: 4 }}>IT'S A TESTING TOOL</div>
      <strong>Custom Tool: {name}</strong>
      {status === "pending" && <span style={{ marginLeft: 8, color: "#facc15" }}>Running...</span>}
      {status === "success" && (
        <span style={{ marginLeft: 8, color: "#4ade80" }}>
          Result: {typeof output === "string" ? output : JSON.stringify(output)}
        </span>
      )}
      {status === "error" && <span style={{ marginLeft: 8, color: "#f87171" }}>Error</span>}
    </div>
  )
}

function ChatPanel({ chat }: { chat: Chat<UIMessage> }) {
  const { messages, sendMessage, status, stop, error } = useChat({ chat })

  return (
    <AnAgentChat
      messages={messages}
      onSend={(msg) => sendMessage({ text: msg.content })}
      status={status}
      onStop={stop}
      error={error ?? undefined}
      toolRenderers={{ test: TestToolRenderer }}
    />
  )
}

export default function Home() {
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [threads, setThreads] = useState<ThreadItem[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)

  // Create chat instance when sandboxId + threadId are ready
  const chat = useMemo(() => {
    if (!sandboxId || !activeThreadId) return null
    return createAnChat({
      agent: "my-agent",
      tokenUrl: "/api/an/token",
      sandboxId,
      threadId: activeThreadId,
    })
  }, [sandboxId, activeThreadId])

  // Initialize: create sandbox, fetch threads, select or create first thread
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      try {
        console.log("[client] Initializing...")

        // Check URL for existing sandboxId
        const params = new URLSearchParams(window.location.search)
        let sbId = params.get("sandboxId")

        if (sbId) {
          console.log(`[client] Found sandboxId in URL: ${sbId}`)
        } else {
          console.log("[client] No sandboxId in URL, creating new sandbox...")
          const sbRes = await fetch("/api/an/sandbox", { method: "POST" })
          if (!sbRes.ok) throw new Error(`Failed to create sandbox: ${sbRes.status}`)
          const data = await sbRes.json()
          sbId = data.sandboxId
          console.log(`[client] Got sandboxId: ${sbId}`)

          // Put sandboxId in URL so reloads reuse it
          const url = new URL(window.location.href)
          url.searchParams.set("sandboxId", sbId!)
          window.history.replaceState({}, "", url.toString())
        }

        setSandboxId(sbId)

        const threadsRes = await fetch(`/api/an/threads?sandboxId=${sbId}`)
        if (!threadsRes.ok) throw new Error(`Failed to fetch threads: ${threadsRes.status}`)
        const existingThreads: ThreadItem[] = await threadsRes.json()
        console.log(`[client] Fetched ${existingThreads.length} existing threads:`, existingThreads)

        if (existingThreads.length > 0) {
          setThreads(existingThreads)
          setActiveThreadId(existingThreads[0]!.id)
          console.log(`[client] Reusing existing threads, active: ${existingThreads[0]!.id}`)
        } else {
          console.log("[client] No existing threads, creating first one...")
          const newRes = await fetch("/api/an/threads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sandboxId: sbId, name: "Thread 1" }),
          })
          if (!newRes.ok) throw new Error(`Failed to create thread: ${newRes.status}`)
          const newThread: ThreadItem = await newRes.json()
          console.log(`[client] Created thread: ${newThread.id}`)
          setThreads([newThread])
          setActiveThreadId(newThread.id)
        }
      } catch (err) {
        console.error("[client] Init failed:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize")
      }
    }

    init()
  }, [])

  const handleNewThread = useCallback(async () => {
    if (!sandboxId) return
    const name = `Thread ${threads.length + 1}`
    try {
      const res = await fetch("/api/an/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sandboxId, name }),
      })
      if (!res.ok) throw new Error(`Failed to create thread: ${res.status}`)
      const thread: ThreadItem = await res.json()
      setThreads((prev) => [thread, ...prev])
      setActiveThreadId(thread.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create thread")
    }
  }, [sandboxId, threads.length])

  const handleSelectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId)
  }, [])

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => {
              setError(null)
              initRef.current = false
              window.location.reload()
            }}
            className="text-sm text-neutral-400 hover:text-white underline"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen flex">
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
      />
      <div className="flex-1">
        {chat ? (
          <ChatPanel key={activeThreadId} chat={chat} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500">
            Loading...
          </div>
        )}
      </div>
    </main>
  )
}
