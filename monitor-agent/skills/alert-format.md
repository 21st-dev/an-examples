# Alert Format

## Chat Output

One line per service. Include change context only when status differs from the snapshot.

```
❓ Vercel — unknown
✅ GitHub — none
✅ Cloudflare — none
✅ Supabase — none
```

Emoji mapping (matches `status.indicator` values from Statuspage API):

| Indicator  | Emoji |
|------------|-------|
| `none`     | ✅    |
| `minor`    | ⚠️    |
| `major`    | 🟡    |
| `critical` | 🔴    |
| unknown    | ❓    |

If Slack is not configured, append:

```
ℹ️ Slack alerts disabled — set SLACK_WEBHOOK_URL to enable
```

## Slack Output

Use Slack-native emoji syntax (not Unicode):

```
:question: Vercel: unknown
Previous: none | Current: unknown
Checked: 2025-01-15 12:00 UTC
```

Slack emoji mapping:

| Indicator  | Slack Emoji              |
|------------|--------------------------|
| `none`     | `:white_check_mark:`     |
| `minor`    | `:warning:`              |
| `major`    | `:large_yellow_circle:`  |
| `critical` | `:red_circle:`           |
| unknown    | `:question:`             |

## Rules

- No markdown in Slack messages — Slack uses mrkdwn, not markdown
- Keep Slack messages under 3000 characters
- Group multiple changes into one Slack message when possible
- Include UTC timestamp on every alert
- Only send Slack alerts when `status.indicator` actually changed
