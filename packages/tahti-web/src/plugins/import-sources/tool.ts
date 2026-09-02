import { SOURCE_DEFS, type IntegrationId } from '../../api/sources';
import { importSourceBase } from './base';
import type { ToolSourceAdapter } from './types';

export const toolSourceAdapters: ToolSourceAdapter[] = SOURCE_DEFS.filter(
  (def): def is SourceDefWithToolKind =>
    def.kind === 'tool' || def.kind === 'upload',
).map((def) => ({
  ...importSourceBase(def),
  kind: def.kind,
}));

type SourceDefWithToolKind = (typeof SOURCE_DEFS)[number] & {
  kind: 'tool' | 'upload';
};

export function toolSourceAdapter(
  id: IntegrationId,
): ToolSourceAdapter | undefined {
  return toolSourceAdapters.find((adapter) => adapter.id === id);
}
