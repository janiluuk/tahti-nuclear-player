import { openUrl } from '@tauri-apps/plugin-opener';

import type { ShellHost } from '@tahti-player/plugin-sdk';

export const shellHost: ShellHost = {
  async openExternal(url: string) {
    await openUrl(url);
  },
};
