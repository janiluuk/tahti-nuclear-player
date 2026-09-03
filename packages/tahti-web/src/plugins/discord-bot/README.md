# Tahti Radio Discord bot add-on

Board-only Settings → Add-ons → **Tools** card for the Discord application ID
and bot token. Configuration is stored by the sibling Tahti API, not in the
browser. Opens a Configure dialog (Client ID + token).

## Contract

Authoritative detail:
[tahti docs/technical/discord-bot-credentials.md](https://github.com/janiluuk/tahti-org/blob/main/docs/technical/discord-bot-credentials.md)

```ts
GET  /api/admin/discord-bot
PUT  /api/admin/discord-bot  { clientId, token? }
```

`GET` never returns the token — only `tokenConfigured` and a last-four hint.
The Discord bot process reads plaintext credentials from
`GET /api/v1/internal/discord-bot/credentials` (Bearer `INTERNAL_SECRET`).

## Permission

The card renders only when `hasAccountRole(user, 'BOARD')`. The API also
enforces `requireBoard`. Non-board users see an empty Tools section for this
entry (the card returns `null`).
