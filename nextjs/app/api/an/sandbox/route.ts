import { AnClient } from "@an-sdk/node"
import { NextResponse } from "next/server"

const an = new AnClient({ apiKey: process.env.AN_API_KEY! })

// In-memory sandbox storage — resets on server restart
let cachedSandboxId: string | null = null

export async function POST() {
  try {
    if (cachedSandboxId) {
      return NextResponse.json({ sandboxId: cachedSandboxId })
    }

    const sandbox = await an.sandboxes.create({ agent: "my-agent" })
    cachedSandboxId = sandbox.id
    return NextResponse.json({ sandboxId: sandbox.id })
  } catch (error) {
    console.error("Failed to create sandbox:", error)
    return NextResponse.json(
      { error: "Failed to create sandbox" },
      { status: 500 },
    )
  }
}
