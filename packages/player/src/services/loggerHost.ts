import type { LoggerHost } from '@tahti-player/plugin-sdk';

import { createPluginLogger } from './logger';

export const createLoggerHost = (pluginId: string): LoggerHost => {
  const logger = createPluginLogger(pluginId);

  return {
    log: (level, message) => {
      void logger[level](message);
    },
  };
};
