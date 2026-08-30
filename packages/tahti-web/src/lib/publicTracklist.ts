export type PublicTracklistCue = {
  id: string;
  title: string;
  artist: string | null;
  artistUsername: string | null;
  startSec: number | null;
};

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asSeconds(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parsePublicTracklist(raw: unknown): PublicTracklistCue[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }
    const row = entry as Record<string, unknown>;
    const title = asString(row.title);
    if (!title) {
      return [];
    }
    return [
      {
        id: asString(row.id) ?? `cue-${index}`,
        title,
        artist: asString(row.artist),
        artistUsername: asString(row.artistUsername),
        startSec: asSeconds(row.startSec),
      },
    ];
  });
}
