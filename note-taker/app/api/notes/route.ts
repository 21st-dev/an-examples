// NOTE: No authentication — suitable for hackathon/demo use.
// For production, add authentication middleware.
import { ConvexHttpClient } from "convex/browser"
import { NextRequest, NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"

function getClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set")
  return new ConvexHttpClient(url)
}

// GET /api/notes — list all notes or search/filter by query or tag
export async function GET(req: NextRequest) {
  try {
    const client = getClient()
    const searchQuery = req.nextUrl.searchParams.get("q")
    const tag = req.nextUrl.searchParams.get("tag")

    let notes
    if (searchQuery) {
      notes = await client.query(api.notes.search, { query: searchQuery })
    } else if (tag) {
      notes = await client.query(api.notes.getByTag, { tag })
    } else {
      notes = await client.query(api.notes.list)
    }

    return NextResponse.json(notes)
  } catch (error) {
    console.error("[notes] GET failed:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

// POST /api/notes — create a new note
export async function POST(req: NextRequest) {
  try {
    const client = getClient()
    const { title, content, tags } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 },
      )
    }

    const id = await client.mutation(api.notes.create, {
      title,
      content,
      tags: tags ?? [],
    })

    return NextResponse.json({ id, title, content, tags: tags ?? [] })
  } catch (error) {
    console.error("[notes] POST failed:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

// PUT /api/notes — update an existing note
export async function PUT(req: NextRequest) {
  try {
    const client = getClient()
    const { id, title, content, tags } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await client.mutation(api.notes.update, {
      id,
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(tags !== undefined && { tags }),
    })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("[notes] PUT failed:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

// DELETE /api/notes — delete a note
export async function DELETE(req: NextRequest) {
  try {
    const client = getClient()
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    await client.mutation(api.notes.remove, { id })

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("[notes] DELETE failed:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
