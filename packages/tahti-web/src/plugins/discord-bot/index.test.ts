import { describe, expect, it } from 'vitest';

import {
  DISCORD_BOT_ADDON_ID,
  validateDiscordBotToken,
  validateDiscordClientId,
} from './index';

describe('discord bot addon settings', () => {
  it('has a stable add-on id', () => {
    expect(DISCORD_BOT_ADDON_ID).toBe('discord-bot');
  });

  it('accepts a Discord snowflake application ID', () => {
    expect(validateDiscordClientId('1168742859038531594')).toBeNull();
    expect(validateDiscordClientId('not-an-id')).not.toBeNull();
    expect(validateDiscordClientId('123')).not.toBeNull();
  });

  it('allows an empty token only when one is already stored', () => {
    expect(validateDiscordBotToken('', true)).toBeNull();
    expect(validateDiscordBotToken('', false)).not.toBeNull();
    expect(
      validateDiscordBotToken(
        '6862f003d299a7bbae32b77682b7be256eb1198f5fbebd0d9ffc0682e35fb4eb',
        false,
      ),
    ).toBeNull();
  });
});
