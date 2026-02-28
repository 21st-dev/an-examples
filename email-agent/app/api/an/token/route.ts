import { createAnTokenHandler } from "@an-sdk/nextjs/server"

export const POST = createAnTokenHandler({
  apiKey: process.env.AN_API_KEY!,
})
