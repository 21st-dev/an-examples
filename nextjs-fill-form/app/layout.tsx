import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AN Agent Chat",
  description: "AI coding agent powered by AN SDK",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
