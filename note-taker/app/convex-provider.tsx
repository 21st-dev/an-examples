"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  if (!convex) {
    return <>{children}</>
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
