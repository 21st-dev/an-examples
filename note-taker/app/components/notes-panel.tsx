"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function NotesList() {
  const notes = useQuery(api.notes.list)

  if (notes === undefined) {
    return (
      <div className="p-4 text-center text-neutral-500 text-sm">
        Loading notes...
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500 text-sm">
        <p>No notes yet.</p>
        <p className="mt-2 text-neutral-600">
          Try saying &quot;Remember: project X deadline is Friday&quot;
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="text-xs text-neutral-500 mt-1 px-4">
        {notes.length} note{notes.length !== 1 ? "s" : ""}
      </p>
      <div className="p-2 space-y-2">
        {notes.map((note) => (
          <div
            key={note._id}
            className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <h3 className="text-sm font-medium text-neutral-200 truncate">
              {note.title}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
              {note.content}
            </p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-800 text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-neutral-600 mt-2">
              {formatDate(note.updatedAt)}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export function NotesPanel() {
  return (
    <aside className="w-80 border-l border-neutral-800 flex flex-col h-full bg-neutral-950">
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
          Saved Notes
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {hasConvex ? (
          <NotesList />
        ) : (
          <div className="p-4 text-center text-neutral-500 text-sm">
            <p>Convex not configured.</p>
            <p className="mt-2 text-neutral-600">
              Set NEXT_PUBLIC_CONVEX_URL in .env.local
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
