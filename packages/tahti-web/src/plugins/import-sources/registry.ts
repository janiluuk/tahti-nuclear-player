import {
  fetchConnectionStatus,
  oauthStartUrl,
  SOURCE_DEFS,
  type IntegrationId,
} from '../../api/sources';
import type {
  ImportSourcePlugin,
  OAuthSourceAdapter,
  SearchSourceAdapter,
  ToolSourceAdapter,
} from './types';

export const importSourcePlugins: ImportSourcePlugin[] = SOURCE_DEFS.map(
  (def) => ({
    ...def,
    oauthUrl: def.oauthStartPath ? oauthStartUrl(def.oauthStartPath) : null,
    checkStatus: () => fetchConnectionStatus(def.id),
  }),
);

export const oauthSourceAdapters = importSourcePlugins.filter(
  (plugin): plugin is OAuthSourceAdapter =>
    plugin.kind === 'oauth' && plugin.oauthUrl !== null,
);

export const searchSourceAdapters = importSourcePlugins.filter(
  (plugin): plugin is SearchSourceAdapter => plugin.kind === 'search',
);

export const toolSourceAdapters = importSourcePlugins.filter(
  (plugin): plugin is ToolSourceAdapter =>
    plugin.kind === 'tool' || plugin.kind === 'upload',
);

export function importSourcePlugin(
  id: IntegrationId,
): ImportSourcePlugin | undefined {
  return importSourcePlugins.find((p) => p.id === id);
}
