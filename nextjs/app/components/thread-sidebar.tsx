import type { ThreadItem } from "../types"

interface ThreadSidebarProps {
  threads: ThreadItem[]
  activeThreadId: string | null
  onSelectThread: (threadId: string) => void
  onNewThread: () => void
}

export function ThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
}: ThreadSidebarProps) {
  return (
    <aside className="w-64 border-r border-neutral-800 flex flex-col h-full">
      <div className="p-3 border-b border-neutral-800">
        <button
          onClick={onNewThread}
          className="w-full px-3 py-2 text-sm bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
        >
          + New Thread
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              thread.id === activeThreadId
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            }`}
          >
            {thread.name || "Untitled"}
          </button>
        ))}
      </div>
    </aside>
  )
}
