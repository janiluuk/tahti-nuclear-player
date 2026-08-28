export type YouTubeLikedSong = {
  title: string;
  artist: string;
  videoId: string;
  artworkUrl?: string;
};

type Renderer = {
  playlistItemData?: { videoId?: string };
  flexColumns?: Array<{
    musicResponsiveListItemFlexColumnRenderer?: {
      text?: { runs?: Array<{ text?: string }> };
    };
  }>;
  thumbnail?: {
    musicThumbnailRenderer?: {
      thumbnail?: { thumbnails?: Array<{ url?: string }> };
    };
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function renderersIn(value: unknown, result: Renderer[] = []): Renderer[] {
  if (!isRecord(value)) {
    return result;
  }
  const renderer = value.musicResponsiveListItemRenderer;
  if (isRecord(renderer)) {
    result.push(renderer as Renderer);
    return result;
  }
  Object.values(value).forEach((child) => renderersIn(child, result));
  return result;
}

function textFrom(renderer: Renderer, column: number): string {
  return (
    renderer.flexColumns?.[
      column
    ]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
      ?.map((run) => run.text ?? '')
      .join('')
      .trim() ?? ''
  );
}

export function parseYouTubeLikedSongs(payload: unknown): YouTubeLikedSong[] {
  return renderersIn(payload)
    .map((renderer) => {
      const videoId = renderer.playlistItemData?.videoId ?? '';
      const title = textFrom(renderer, 0);
      const artist = textFrom(renderer, 1).split('•')[0]?.trim() ?? '';
      const artworkUrl =
        renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.at(
          -1,
        )?.url;
      return { title, artist, videoId, artworkUrl };
    })
    .filter((song) => song.videoId && song.title);
}
