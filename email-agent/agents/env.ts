import { readFileSync } from "fs"

let sandboxEnvLoaded = false

function loadSandboxEnv() {
  if (sandboxEnvLoaded) return
  sandboxEnvLoaded = true

  try {
    const raw = readFileSync("/home/user/.env", "utf-8")
    for (const line of raw.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (!match) continue
      const key = match[1].trim()
      const value = match[2].trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // Sandbox .env is optional in local/dev contexts.
  }
}

export function getEnv(name: string): string {
  if (process.env[name]) return process.env[name] as string
  loadSandboxEnv()
  return process.env[name] ?? ""
}

export type AgentMailConfigResult =
  | { ok: true; apiKey: string; inboxId: string }
  | { ok: false; error: string }

export function getAgentMailConfig(): AgentMailConfigResult {
  const apiKey = getEnv("AGENTMAIL_API_KEY")
  const inboxId = getEnv("AGENTMAIL_INBOX_ID")

  if (!apiKey) return { ok: false, error: "AGENTMAIL_API_KEY is not configured" }
  if (!inboxId) return { ok: false, error: "AGENTMAIL_INBOX_ID is not configured" }

  return { ok: true, apiKey, inboxId }
}
