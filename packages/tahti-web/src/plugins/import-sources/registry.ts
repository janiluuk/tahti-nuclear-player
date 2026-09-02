import { SOURCE_DEFS, type IntegrationId } from '../../api/sources';
import { oauthSourceAdapters } from './oauth';
import { searchSourceAdapters } from './search';
import { toolSourceAdapters } from './tool';
import type { ImportSourcePlugin, SourceAdapter } from './types';

export const importSourcePlugins: ImportSourcePlugin[] = [
  ...oauthSourceAdapters,
  ...searchSourceAdapters,
  ...toolSourceAdapters,
];

export function importSourcePlugin(
  id: IntegrationId,
): ImportSourcePlugin | undefined {
  return importSourcePlugins.find((plugin) => plugin.id === id);
}

export function sourceAdapter(id: IntegrationId): SourceAdapter | undefined {
  return (
    oauthSourceAdapters.find((adapter) => adapter.id === id) ??
    searchSourceAdapters.find((adapter) => adapter.id === id) ??
    toolSourceAdapters.find((adapter) => adapter.id === id)
  );
}

export function assertSourceCatalogCoverage() {
  const adapterIds = new Set(importSourcePlugins.map((plugin) => plugin.id));
  for (const def of SOURCE_DEFS) {
    if (!adapterIds.has(def.id)) {
      throw new Error(`Source ${def.id} is missing a kind adapter`);
    }
  }
}
