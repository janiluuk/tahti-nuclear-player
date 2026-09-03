export const DISCORD_BOT_ADDON_ID = 'discord-bot';

export const DISCORD_BOT_ADDON = {
  id: DISCORD_BOT_ADDON_ID,
  name: 'Tahti Radio Discord bot',
  author: 'Tahti',
  description:
    'Application ID and bot token for the 24/7 Tahti Radio Discord bot. Board admins only.',
} as const;

const CLIENT_ID_PATTERN = /^\d{17,20}$/;

export function validateDiscordClientId(value: string): string | null {
  const trimmed = value.trim();
  if (!CLIENT_ID_PATTERN.test(trimmed)) {
    return 'Application ID must be the 17–20 digit Client ID from the Discord Developer Portal.';
  }
  return null;
}

export function validateDiscordBotToken(
  value: string,
  tokenAlreadyConfigured: boolean,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return tokenAlreadyConfigured ? null : 'Bot token is required.';
  }
  if (trimmed.length < 20) {
    return 'Bot token looks too short.';
  }
  return null;
}
