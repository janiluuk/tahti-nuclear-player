/** Seed catalog of Finnish internet radio stations, sourced from
 * https://streamurl.link/country/fi/ (station name, logo, language,
 * bitrate/codec — user-provided source, fetched 2026-08-25).
 *
 * streamurl.link's actual stream URL is loaded client-side behind a
 * "Copy" button and isn't present in the page's static HTML, so it
 * can't be verified here — `streamUrl` is left `null` rather than
 * guessed. `detailUrl` (the station's real streamurl.link page, which
 * *was* fetched directly) is the honest fallback: it always resolves to
 * a real, working way to find the live stream. An admin approving a
 * station suggestion (see AdminRadioStationSuggestionsView) can fill in
 * a verified `streamUrl` directly.
 */

export type RadioStation = {
  id: string;
  name: string;
  logoUrl: string;
  language: string;
  bitrateKbps: number;
  codec: string;
  genre: string;
  /** Real playable stream URL, once verified — null until then. */
  streamUrl: string | null;
  /** streamurl.link's own station page — always a real, working link. */
  detailUrl: string;
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'nrj-fi',
    name: 'NRJ',
    logoUrl: 'https://www.streamurl.link/logos/dxnTnXYfLpc.webp',
    language: 'Finnish',
    bitrateKbps: 64,
    codec: 'AAC',
    genre: 'Pop',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/nrj-6/',
  },
  {
    id: 'radio-nova',
    name: 'Radio Nova',
    logoUrl: 'https://www.streamurl.link/logos/pcthRzNrd9r.webp',
    language: 'Finnish',
    bitrateKbps: 128,
    codec: 'MP3',
    genre: 'Pop',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/radio-nova-1/',
  },
  {
    id: 'radio-helsinki',
    name: 'Radio Helsinki',
    logoUrl: 'https://www.streamurl.link/logos/JoiOnv3Q9An.webp',
    language: 'Finnish',
    bitrateKbps: 256,
    codec: 'MP3',
    genre: 'World',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/radio-helsinki/',
  },
  {
    id: 'popfm',
    name: 'POPfm',
    logoUrl: 'https://www.streamurl.link/logos/YuG0WCcB0Zp.webp',
    language: 'Finnish',
    bitrateKbps: 192,
    codec: 'MP3',
    genre: 'Pop',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/popfm/',
  },
  {
    id: 'kasari',
    name: 'Kasari',
    logoUrl: 'https://www.kasariradio.fi/logos/pOrNqb5dLyS.webp',
    language: 'Finnish',
    bitrateKbps: 128,
    codec: 'MP3',
    genre: '80s',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/kasari/',
  },
  {
    id: 'finest-fm',
    name: 'Finest FM',
    logoUrl: 'https://www.streamurl.link/logos/3t2bbAg6o9N.webp',
    language: 'Estonian',
    bitrateKbps: 192,
    codec: 'MP3',
    genre: 'Classic Hits',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/finest-fm/',
  },
  {
    id: 'ysari',
    name: 'Ysäri',
    logoUrl: 'https://www.streamurl.link/logos/DFc2nDnEDyO.webp',
    language: 'Finnish',
    bitrateKbps: 128,
    codec: 'MP3',
    genre: '90s',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/ysaeri/',
  },
  {
    id: 'radio-nostalgia',
    name: 'Radio Nostalgia',
    logoUrl: 'https://www.streamurl.link/logos/NHnPr5Rwpmq.webp',
    language: 'Finnish',
    bitrateKbps: 128,
    codec: 'MP3',
    genre: 'Pop',
    streamUrl: null,
    detailUrl: 'https://streamurl.link/station/radio-nostalgia/',
  },
];

export function radioStation(id: string): RadioStation | undefined {
  return RADIO_STATIONS.find((s) => s.id === id);
}

/** Builds a TahtiPlayable for a station with a verified stream — callers
 * must check `station.streamUrl` first (kept nullable rather than typed
 * away so every call site is forced to handle the pending case). */
export function radioStationPlayable(
  station: RadioStation & { streamUrl: string },
): {
  id: string;
  kind: 'radio';
  title: string;
  artist: string;
  coverUrl: string;
  streamUrl: string;
  protocol: 'https';
  sourceProvider: string;
} {
  return {
    id: `radio-widget:${station.id}`,
    kind: 'radio',
    title: station.name,
    artist: `${station.language} · ${station.genre}`,
    coverUrl: station.logoUrl,
    streamUrl: station.streamUrl,
    protocol: 'https',
    sourceProvider: 'internet-radio',
  };
}
