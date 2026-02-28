import type { AgentMailConfigResult } from "./env"

type ApiResult =
  | { ok: true; data: unknown }
  | { ok: false; status?: number; error: unknown }

async function parseResponse(response: Response): Promise<unknown> {
  const raw = await response.text()
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return raw
  }
}

function authHeaders(config: Extract<AgentMailConfigResult, { ok: true }>) {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  }
}

export async function sendMessage(
  config: Extract<AgentMailConfigResult, { ok: true }>,
  input: { to: string; subject: string; text: string; html?: string },
): Promise<ApiResult> {
  try {
    const response = await fetch(
      `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(config.inboxId)}/messages/send`,
      {
        method: "POST",
        headers: authHeaders(config),
        body: JSON.stringify({
          to: input.to,
          subject: input.subject,
          text: input.text,
          ...(input.html ? { html: input.html } : {}),
        }),
      },
    )

    const parsed = await parseResponse(response)
    if (!response.ok) return { ok: false, status: response.status, error: parsed || "AgentMail send failed" }
    return { ok: true, data: parsed }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function readMessages(
  config: Extract<AgentMailConfigResult, { ok: true }>,
  limit: number,
): Promise<ApiResult> {
  try {
    const response = await fetch(
      `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(config.inboxId)}/messages?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      },
    )
    const parsed = await parseResponse(response)
    if (!response.ok) return { ok: false, status: response.status, error: parsed || "AgentMail read failed" }
    return { ok: true, data: parsed }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function replyToMessage(
  config: Extract<AgentMailConfigResult, { ok: true }>,
  input: { messageId: string; text: string; html?: string; replyAll?: boolean },
): Promise<ApiResult> {
  try {
    const response = await fetch(
      `https://api.agentmail.to/v0/inboxes/${encodeURIComponent(config.inboxId)}/messages/${encodeURIComponent(input.messageId)}/reply`,
      {
        method: "POST",
        headers: authHeaders(config),
        body: JSON.stringify({
          text: input.text,
          ...(input.html ? { html: input.html } : {}),
          ...(input.replyAll ? { reply_all: true } : {}),
        }),
      },
    )
    const parsed = await parseResponse(response)
    if (!response.ok) return { ok: false, status: response.status, error: parsed || "AgentMail auto reply failed" }
    return { ok: true, data: parsed }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
