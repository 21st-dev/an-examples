# Monitoring Strategy

## Preconfigured Services

When the user says "check all", fetch status for each of these:

| Service    | Endpoint                                                |
|------------|---------------------------------------------------------|
| Vercel     | `https://www.vercel-status.com/api/v2/broken.json`      |
| GitHub     | `https://www.githubstatus.com/api/v2/status.json`       |
| Cloudflare | `https://www.cloudflarestatus.com/api/v2/status.json`   |
| Supabase   | `https://status.supabase.com/api/v2/status.json`        |

The user can also provide custom Statuspage URLs — any `/api/v2/status.json` endpoint works.

## Endpoint Format

These services use [Atlassian Statuspage](https://www.atlassian.com/software/statuspage). The standard JSON endpoints:

- `/api/v2/status.json` — overall status indicator
- `/api/v2/summary.json` — component-level detail (fetch only when needed)

## Status Indicators

The `status.indicator` field from the API:

| Indicator  | Meaning              |
|------------|----------------------|
| `none`     | All systems operational |
| `minor`    | Degraded performance |
| `major`    | Partial outage       |
| `critical` | Major outage         |
| `unknown`  | Status page unreachable or non-JSON response |

## Comparison Rules

1. Compare `status.indicator` between the current fetch and the stored snapshot
2. Check the `components` array for per-component changes
3. Ignore cosmetic fields: page name, `updated_at`, page ID
4. Only alert on actual indicator changes — not timestamp-only updates

## Snapshot Format

```json
{
  "indicator": "none",
  "components": [
    { "name": "API", "status": "operational" },
    { "name": "Dashboard", "status": "operational" }
  ],
  "checkedAt": "2025-01-15T12:00:00Z"
}
```

## Error Handling

- If a fetch fails, set the service indicator to `unknown`
- **Always save a snapshot**, even for failed fetches — save with `indicator: "unknown"` so future runs can detect changes
- Treat `unknown` as a real status for comparison purposes:
  - `none` → `unknown` = status changed → **send alert**
  - `unknown` → `unknown` = no change → no alert
  - `unknown` → `none` = recovered → **send alert**
- On first run (no prior snapshot), save baseline snapshots for all services including failed ones — no alerts needed
- No retry logic needed; the agent runs again on the next check cycle
