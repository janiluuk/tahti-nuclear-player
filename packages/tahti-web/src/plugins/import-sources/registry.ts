import {
  fetchConnectionStatus,
  oauthStartUrl,
  SOURCE_DEFS,
  type IntegrationId,
} from '../../api/sources';
import type { ImportSourcePlugin } from './types';

export const importSourcePlugins: ImportSourcePlugin[] = SOURCE_DEFS.map(
  (def) => ({
    ...def,
    oauthUrl: def.oauthStartPath ? oauthStartUrl(def.oauthStartPath) : null,
    checkStatus: () => fetchConnectionStatus(def.id),
  }),
);

export function importSourcePlugin(
  id: IntegrationId,
): ImportSourcePlugin | undefined {
  return importSourcePlugins.find((p) => p.id === id);
}
