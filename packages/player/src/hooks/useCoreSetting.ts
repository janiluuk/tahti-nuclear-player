import { useSetting } from '@tahti-player/plugin-sdk';
import type { SettingValue } from '@tahti-player/plugin-sdk';

import { coreSettingsHost } from '../services/settingsHost';

export const useCoreSetting = <T extends SettingValue = SettingValue>(
  id: string,
) => useSetting<T>(coreSettingsHost, id);
