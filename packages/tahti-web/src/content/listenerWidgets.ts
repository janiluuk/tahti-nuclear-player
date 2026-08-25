/** Listener widgets — pluggable, app-store-style embeds that play content
 * from an external platform inline on the Listen page, using that
 * platform's own official embedded player (SoundCloud's Widget API,
 * YouTube's IFrame Player API). This is deliberately not a port of
 * Nuclear desktop's StreamProvider plugin system (search/resolve/stream
 * through a sandboxed plugin host) — a browser can't proxy audio out of
 * SoundCloud/YouTube without violating their ToS, so "playing" their
 * content here means embedding the real widget, the same way any website
 * legitimately does.
 */

export type ListenerWidgetTypeId = 'soundcloud' | 'youtube';

export type ListenerWidgetType = {
  id: ListenerWidgetTypeId;
  name: string;
  author: string;
  description: string;
  category: string;
  placeholder: string;
  helpText: string;
  /** Height for the embedded iframe — SoundCloud tracks/playlists and
   * YouTube videos read at very different aspect ratios. */
  embedHeight: number;
  /** Turns a pasted URL into an embeddable player src, or null if the
   * input isn't a recognized URL shape for this platform. */
  toEmbedUrl: (input: string) => string | null;
};

function soundcloudEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!/^https:\/\/(www\.)?soundcloud\.com\/\S+/i.test(trimmed)) {
    return null;
  }
  const params = new URLSearchParams({
    url: trimmed,
    color: '%23ff5500',
    auto_play: 'false',
    show_user: 'true',
    show_reposts: 'false',
    visual: 'false',
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

function youtubeIds(input: string): {
  videoId: string | null;
  playlistId: string | null;
} {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return { videoId: null, playlistId: null };
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    return { videoId: url.pathname.slice(1) || null, playlistId: null };
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const playlistId = url.searchParams.get('list');
    if (url.pathname === '/watch') {
      return { videoId: url.searchParams.get('v'), playlistId };
    }
    if (url.pathname.startsWith('/embed/')) {
      return { videoId: url.pathname.split('/')[2] ?? null, playlistId };
    }
    if (url.pathname === '/playlist') {
      return { videoId: null, playlistId };
    }
  }
  return { videoId: null, playlistId: null };
}

function youtubeEmbedUrl(input: string): string | null {
  const { videoId, playlistId } = youtubeIds(input);
  if (videoId) {
    return playlistId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?list=${playlistId}`
      : `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  if (playlistId) {
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`;
  }
  return null;
}

export const LISTENER_WIDGET_TYPES: ListenerWidgetType[] = [
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    author: 'SoundCloud',
    description:
      "Play a SoundCloud track, set, or playlist inline using SoundCloud's own embedded player.",
    category: 'Streaming',
    placeholder: 'https://soundcloud.com/artist/track',
    helpText: 'Paste a SoundCloud track, set, or playlist URL.',
    embedHeight: 166,
    toEmbedUrl: soundcloudEmbedUrl,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    author: 'YouTube',
    description:
      "Play a YouTube video or playlist inline using YouTube's own embedded player.",
    category: 'Streaming',
    placeholder: 'https://www.youtube.com/watch?v=…',
    helpText: 'Paste a YouTube video or playlist URL.',
    embedHeight: 220,
    toEmbedUrl: youtubeEmbedUrl,
  },
];

export function listenerWidgetType(id: string): ListenerWidgetType | undefined {
  return LISTENER_WIDGET_TYPES.find((t) => t.id === id);
}
