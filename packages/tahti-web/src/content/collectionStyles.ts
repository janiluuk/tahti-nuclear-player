/** Collection "style" — mirrors the backend's Collection.style enum (a
 * playlist/album/podcast/etc. classifier, distinct from `type`). Single
 * source of truth for the label and the raw-value → known-style
 * normalization, shared between the collections list (filter tabs + quick
 * create) and the collection editor, so a style added in one no longer
 * silently falls through a default bucket in the other. */
export type CollectionStyleId =
  | 'ALBUM'
  | 'EP'
  | 'SINGLE'
  | 'PLAYLIST'
  | 'PODCAST'
  | 'DJ_SET_SERIES'
  | 'SERIES';

export type CollectionStyleOption = {
  id: CollectionStyleId;
  label: string;
};

export const COLLECTION_STYLES: CollectionStyleOption[] = [
  { id: 'ALBUM', label: 'Album' },
  { id: 'EP', label: 'EP' },
  { id: 'SINGLE', label: 'Single' },
  { id: 'PLAYLIST', label: 'Playlist' },
  { id: 'PODCAST', label: 'Podcast' },
  { id: 'DJ_SET_SERIES', label: 'DJ set' },
  { id: 'SERIES', label: 'Show series' },
];

export function collectionStyleLabel(style: string | null | undefined): string {
  if (!style) {
    return 'Unknown';
  }
  const match = COLLECTION_STYLES.find((s) => s.id === style.toUpperCase());
  return match?.label ?? style;
}

/** Normalizes a collection's raw `style` (falling back to `type`) into one
 * of the known style ids, for grouping and filter-tab bucketing. Handles
 * legacy aliases (`MIX_SERIES`, `CUSTOM`, `LIST`) that predate the current
 * enum, and defaults an unrecognized/absent value to ALBUM, same as
 * before — but every known id now maps to itself, so a style this app
 * already lets you set (e.g. SINGLE) can no longer be miscategorized. */
export function normalizeCollectionStyle(
  style: string | null | undefined,
): CollectionStyleId {
  const upper = style?.toUpperCase();
  if (upper === 'MIX_SERIES') {
    return 'DJ_SET_SERIES';
  }
  if (!upper || upper === 'CUSTOM' || upper === 'LIST') {
    return 'PLAYLIST';
  }
  const match = COLLECTION_STYLES.find((s) => s.id === upper);
  return match?.id ?? 'ALBUM';
}
