import { z } from "zod"

const browserUseRawSchema = z.object({
  url: z.string().url(),
  request: z.string().min(1),
  data: z.array(z.record(z.unknown())),
  notes: z.string().nullable().optional(),
})

interface BrowserUseTaskCreatedResponse {
  id?: string
}

interface BrowserUseTaskStatusResponse {
  status?: string
  output?: unknown
}

export function textResult(data: object, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    ...(isError ? { isError: true } : {}),
  }
}

function parseJsonOutput(rawOutput: unknown): unknown {
  if (rawOutput === null || rawOutput === undefined) return null
  if (typeof rawOutput === "string") {
    try {
      return JSON.parse(rawOutput)
    } catch {
      return rawOutput
    }
  }
  return rawOutput
}

export function normalizeExtractionResult(input: unknown, url: string, request: string) {
  const fallback = {
    url,
    request,
    data: [] as Array<Record<string, unknown>>,
    notes: "Browser Use returned an unexpected output shape.",
  }

  if (!input || typeof input !== "object") return fallback

  const maybe = input as {
    url?: unknown
    request?: unknown
    data?: unknown
    notes?: unknown
  }

  const parsed = browserUseRawSchema.safeParse({
    url: typeof maybe.url === "string" ? maybe.url : url,
    request: typeof maybe.request === "string" ? maybe.request : request,
    data: Array.isArray(maybe.data) ? maybe.data : [],
    notes: typeof maybe.notes === "string" ? maybe.notes : null,
  })

  if (!parsed.success) return fallback
  return parsed.data
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runBrowserUseExtraction(config: { apiKey: string; baseUrl: string }, params: { url: string; request: string }) {
  const { apiKey, baseUrl } = config
  const { url, request } = params

  const extractionSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      url: { type: "string" },
      request: { type: "string" },
      data: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
        },
      },
      notes: { type: ["string", "null"] },
    },
    required: ["url", "request", "data"],
  }

  const taskPrompt = [
    `Open this URL: ${url}`,
    `Extraction request: ${request}`,
    "Return ONLY JSON matching the provided schema.",
    "Set missing values to null instead of guessing.",
    "Include a notes field when blocked by auth/captcha/anti-bot or when data quality is limited.",
  ].join("\n")

  const hostname = new URL(url).hostname

  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Browser-Use-API-Key": apiKey,
    },
    body: JSON.stringify({
      task: taskPrompt,
      startUrl: url,
      structuredOutput: JSON.stringify(extractionSchema),
      maxSteps: 100,
      allowedDomains: [hostname],
      highlightElements: false,
      flashMode: false,
    }),
  })

  if (!createResponse.ok) {
    const details = await createResponse.text()
    return textResult(
      {
        error: `Browser Use task creation failed (${createResponse.status})`,
        details,
      },
      true,
    )
  }

  const created = (await createResponse.json()) as BrowserUseTaskCreatedResponse
  if (!created.id) {
    return textResult({ error: "Browser Use did not return a task id." }, true)
  }

  for (let attempt = 0; attempt < 180; attempt++) {
    await sleep(2000)

    const statusResponse = await fetch(`${baseUrl}/tasks/${created.id}/status`, {
      method: "GET",
      headers: {
        "X-Browser-Use-API-Key": apiKey,
      },
    })

    if (!statusResponse.ok) {
      const details = await statusResponse.text()
      return textResult(
        {
          error: `Browser Use polling failed (${statusResponse.status})`,
          details,
        },
        true,
      )
    }

    const statusPayload = (await statusResponse.json()) as BrowserUseTaskStatusResponse

    if (statusPayload.status === "finished") {
      const parsedOutput = parseJsonOutput(statusPayload.output)
      const normalized = normalizeExtractionResult(parsedOutput, url, request)
      return textResult(normalized)
    }

    if (statusPayload.status === "stopped") {
      return textResult(
        {
          url,
          request,
          data: [],
          notes:
            "Browser Use task stopped before completion (possibly timeout, interruption, or site blocking).",
        },
        true,
      )
    }
  }

  return textResult(
    {
      url,
      request,
      data: [],
      notes: "Browser Use task timed out before completion.",
    },
    true,
  )
}

export const submitExtractionInputSchema = z.object({
  url: z.string().url(),
  request: z.string().min(1),
  data: z.array(z.record(z.unknown())),
  notes: z.string().nullable().optional(),
})

export const browserUseExtractInputSchema = z.object({
  url: z.string().url().describe("The exact page URL to open in Browser Use"),
  request: z.string().min(1).describe("What to extract, including fields and filtering rules"),
})
