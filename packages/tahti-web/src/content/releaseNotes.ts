export type ReleaseNote = {
  version: string;
  date: string;
  highlights: string[];
};

/** Plain-language, user-facing release notes — one entry per shipped batch
 * of work, translated from the engineering detail in UI-REDESIGN-WORKLOG.md
 * into what an artist or listener would actually notice. Not every internal
 * version bump gets its own entry; small consistency/cleanup passes are
 * folded into the next user-visible entry instead of listed on their own. */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '0.0.23',
    date: '2026-09-03',
    highlights: [
      'Channel Designer is reorganized into clear sections, and visualizers now have plain descriptive names instead of technical ones.',
      'Added text overlays and clickable link blocks you can place on your channel page, plus a shared cover/backdrop upload flow.',
      'Elements now snap to a grid so channel layouts line up automatically.',
      'You can share a private link to a sound in your Stash before it is public, so collaborators can preview it early.',
    ],
  },
  {
    version: '0.0.20',
    date: '2026-09-02',
    highlights: [
      'The Help Center is reorganized into simple, tabbed categories instead of one long scrolling page, with working links throughout and related guides suggested at the bottom of each article.',
      'Added an admin page that gathers previously hard-to-find pages in one place, reachable from the admin menu.',
    ],
  },
  {
    version: '0.0.19',
    date: '2026-09-01',
    highlights: [
      'New Favourites panel for tracking channels, playlists, and artists you follow, plus timeline reactions and shareable public playlists.',
      'Added a "What is Tahti" page and a radio station browser.',
      'Renamed from Nuclear to Tahti Player throughout the app.',
    ],
  },
  {
    version: '0.0.17',
    date: '2026-09-01',
    highlights: [
      'Added a Governance section for cooperative members: votes, records, and a clear path to it from Settings.',
      'Smoother artist subscription flow.',
      'Consistent track listings across Studio and Library, and polished studio publishing and branding tools.',
    ],
  },
  {
    version: '0.0.11',
    date: '2026-08-31',
    highlights: [
      'Faster page loads and playback fixes across navigation.',
      'Menus and sidebars now behave correctly on tablet-sized screens.',
    ],
  },
];
