import { AnClient } from "@an-sdk/node"
import { NextResponse } from "next/server"

const an = new AnClient({ apiKey: process.env.AN_API_KEY! })

let cachedSandboxId: string | null = null

export async function POST() {
  try {
    if (cachedSandboxId) {
      console.log(`[sandbox] Reusing cached sandboxId: ${cachedSandboxId}`)
      return NextResponse.json({ sandboxId: cachedSandboxId })
    }

    console.log("[sandbox] No cached sandbox, creating new one...")
    const sandbox = await an.sandboxes.create({ agent: "note-taker" })
    cachedSandboxId = sandbox.id
    console.log(`[sandbox] Created new sandbox: ${sandbox.id}`)
    return NextResponse.json({ sandboxId: sandbox.id })
  } catch (error) {
    console.error("[sandbox] Failed to create sandbox:", error)
    return NextResponse.json(
      { error: "Failed to create sandbox" },
      { status: 500 },
    )
  }
}
