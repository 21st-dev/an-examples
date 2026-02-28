import type { Metadata } from "next"
import { ConvexClientProvider } from "./convex-provider"
import "./globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "AN Note Taker Agent",
  description: "Hackathon-ready Next.js + AN + Convex note-taking agent template",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
