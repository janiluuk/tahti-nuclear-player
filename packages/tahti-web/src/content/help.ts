import { PLUGIN_HELP_TABLE } from './pluginHelpCatalog';

export type HelpTable = {
  columns: string[];
  rows: string[][];
};

export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  /** Production deep-link on tahti.live — omit for POC-only articles with no prod equivalent. */
  productionPath?: string;
  sections: Array<{ heading: string; body: string[]; table?: HelpTable }>;
};

export const HELP_HUB_INTRO =
  'Guides for listening, broadcasting, add-ons, account tiers, and getting in touch.';

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'for-listeners',
    title: 'Listener guide',
    description:
      'Find channels, support artists directly, download, and chat — no account required.',
    productionPath: '/help/for-listeners',
    sections: [
      {
        heading: 'Find something to listen to',
        body: [
          'Browse who’s on air from Listen, or open a channel at /channel/$slug.',
          'When an artist is offline, their channel still plays archive items.',
          'Tahti Radio (/radio) is a fair-rotation stream across the community.',
          'Signed-in listeners can install Disco-widgets on Listen from Settings → Add-ons → Discovery.',
        ],
      },
      {
        heading: 'Support an artist',
        body: [
          'Open /u/$username and choose Subscribe — fan tiers are set by the artist.',
          'Most of what you pay goes to the artist; cancel any time from your account.',
        ],
      },
      {
        heading: 'Chat',
        body: [
          'Chat is open on live channels. Anonymous joining may require hCaptcha.',
          'Moderators can mute or remove disruptive messages.',
        ],
      },
    ],
  },
  {
    slug: 'for-artists',
    title: 'Artist guide',
    description:
      'Create your channel, go live, upload sets, and share your public links.',
    productionPath: '/help/for-artists',
    sections: [
      {
        heading: 'Create your channel',
        body: [
          'In Studio, set your channel slug — your public channel is /channel/your-slug, and your artist profile is /u/your-username.',
          'Use the Studio tools to broadcast, manage music, plan shows, understand your audience, and design your channel.',
        ],
      },
      {
        heading: 'Go live & publish',
        body: [
          'Copy RTMP or Icecast credentials from the broadcast studio, then stream from OBS, Mixxx, or Traktor.',
          'Upload archive sets and releases from the studio; they appear on your channel and profile.',
        ],
      },
    ],
  },
  {
    slug: 'broadcast',
    title: 'Broadcast setup',
    description:
      'Connect OBS, Streamlabs, Mixxx, or Traktor to your Tahti stream key.',
    productionPath: '/help/broadcast',
    sections: [
      {
        heading: 'OBS / Streamlabs (RTMP)',
        body: [
          'Dashboard → Go Live → copy Server and Stream Key.',
          'OBS → Settings → Stream: Service Custom, paste server and key.',
          'Audio bitrate 128–192 kbps AAC. Start Streaming — channel shows Live when ingest connects.',
        ],
      },
      {
        heading: 'Phone',
        body: [
          'Same RTMP credentials work in Larix Broadcaster and similar apps.',
        ],
      },
    ],
  },
  {
    slug: 'releasing',
    title: 'Releasing music',
    description:
      'A simple guide to preparing a release, choosing identifiers, and sharing it everywhere.',
    productionPath: '/help/releasing',
    sections: [
      {
        heading: 'Which release method should I use?',
        body: [
          'You do not need every method. Choose the ones that match what you already have.',
          'UPC / EAN is the barcode that identifies the whole release. Use it when a label, distributor, or barcode provider has given you one.',
          'MusicBrainz is a community-maintained music catalog. Use it when you want your release and artist information to be part of an open public database.',
          'Discogs is another community catalog, especially useful for physical releases and historical editions.',
          'Smart links collect the places where people can listen — such as Spotify, Apple Music, Bandcamp, SoundCloud, YouTube Music, and Tidal — onto one Tahti page.',
          'Delivery sends eligible release information to a distribution service such as Revelator. It is the automated option for delivering music to supported DSPs; fees or requirements may apply.',
        ],
      },
      {
        heading: 'A straightforward release workflow',
        body: [
          'Create the release in Studio → Releases and add the final tracklist, artwork, date, and description.',
          'Open Release ops → Catalog & credits. Turn on only the methods you want to use; each method then shows the fields it needs.',
          'Save your catalog information. Export JSON when you want a portable copy of the release metadata.',
          'Use the Guides icons for MusicBrainz or Discogs. Their Copy prefill actions prepare the title, barcode, credits, and tracklist for you, while the external links open the relevant service.',
          'After submitting to an external catalog, copy its release or artist ID back into Tahti so the connection is recorded.',
        ],
      },
      {
        heading: 'MusicBrainz in plain language',
        body: [
          'Open the MusicBrainz release editor from the Guide. Choose the release type, enter the artist and date, add the tracks in order, and save the entry.',
          'MusicBrainz is not a music store and does not deliver audio to Spotify. It is an open reference catalog, so use it for accurate public metadata and identification.',
        ],
      },
      {
        heading: 'Discogs in plain language',
        body: [
          'Search Discogs before creating a new entry so you do not duplicate an existing release.',
          'Use Discogs for cataloging an edition, label, format, country, date, barcode, and tracklist. It is especially useful when documenting vinyl, CD, or other physical versions.',
        ],
      },
      {
        heading: 'What the technical fields mean',
        body: [
          'A release MBID is MusicBrainz’s unique ID for the release. An artist MBID identifies the artist there. A Discogs release ID identifies the Discogs entry.',
          'P-line describes who owns the recording copyright. C-line describes who owns the artwork or publishing copyright. Label imprint is the label name shown with the release.',
          'If you do not know a field, leave that method switched off or ask your label/distributor. Do not invent identifiers.',
        ],
      },
    ],
  },
  {
    slug: 'multistream',
    title: 'Multistream',
    description:
      'Mirror your live broadcast to YouTube, Twitch, and other platforms.',
    productionPath: '/help/multistream',
    sections: [
      {
        heading: 'How it works',
        body: [
          'Stream once to Tahti. Multistream targets are configured in the studio — do not point OBS at YouTube/Twitch keys directly if Tahti is already mirroring.',
          'Supported destinations include YouTube Live, Twitch, Facebook Live, Kick, Mixcloud, and others when RTMP keys are available.',
        ],
      },
    ],
  },
  {
    slug: 'tier-limits',
    title: 'Free tier vs membership',
    description:
      'Live-hour limits, audio quality, and what changes when you support Tahti ry.',
    productionPath: '/help/tier-limits',
    sections: [
      {
        heading: 'Free-tier artist',
        body: [
          'About 1 hour of live broadcasting per week (resets Monday 00:00 UTC).',
          'Listeners hear MP3 ~192 kbps HLS; archive plays when you are offline.',
        ],
      },
      {
        heading: 'Tahti ry member',
        body: [
          'Unlimited live time and cooperative support (€40/year membership).',
          'Membership is support for the org, not a consumer “plan”.',
        ],
      },
    ],
  },
  {
    slug: 'keyboard-shortcuts',
    title: 'Keyboard shortcuts',
    description:
      'Every global shortcut in the app, including the guided page tour.',
    sections: [
      {
        heading: 'Page tour',
        body: [
          'H — open a guided tour of the current page, explaining what each nav item does.',
          '← / → — move between tour steps. Esc or H again — close the tour.',
          'The sidebar is explained everywhere; the top bar only on the homepage; Studio and Admin panel items while you’re inside those sections.',
        ],
      },
      {
        heading: 'Navigation',
        body: [
          'Alt+1 — Listen',
          'Alt+2 — Radio',
          'Alt+3 — Feed',
          'Alt+4 — My Library',
          'Alt+5 — Studio',
        ],
      },
      {
        heading: 'Player',
        body: [
          'V — toggle the full-screen player (only while a track is loaded).',
        ],
      },
      {
        heading: 'Notes',
        body: [
          'Shortcuts are disabled while typing in a text field, textarea, dropdown, or any editable content.',
        ],
      },
    ],
  },
  {
    slug: 'add-ons',
    title: 'Add-ons and plugins',
    description:
      'What is ready today in Settings → Add-ons, and how to turn each one on.',
    sections: [
      {
        heading: 'Where add-ons live',
        body: [
          'Open Settings → Add-ons. Categories match the table below: Themes, Visualizers, Import, Multicast, Fingerprinting, Audio plugins, Radio, Embed, Discovery, Channel, and Playback.',
          'Only integrations you can use now are listed. Planned Nuclear registry items such as Last.fm scrobbling, OmniSource, KHInsider, and NetEase stay out of this guide until they have a Tahti contract.',
        ],
      },
      {
        heading: 'Ready plugins',
        body: [
          'State Ready means the path works end to end, including in-app playback where the row says so. Importer ready or Search ready means the connect/search half works, but the remaining piece — usually a server-side import contract — is still pending; check the “How to use it” column for the exact limit.',
          'hearthis.at, Mixcloud, Spotify, and Bandcamp tracks are referenced rather than hosted: Tahti keeps only a link, and that provider’s own widget supplies the audio when you press play on one of their tracks, including on a track’s own page.',
        ],
        table: PLUGIN_HELP_TABLE,
      },
      {
        heading: 'If something is missing',
        body: [
          'Export destinations such as Spotify or Apple Music are release-delivery links in Studio → Distribution, not installable plugins yet.',
          'Import sources are managed from Add-ons → Import. Only sources with a working Tahti runtime are shown there.',
        ],
      },
    ],
  },
  {
    slug: 'disco-widgets',
    title: 'Contribute a Disco-widget',
    description:
      'Build a sandboxed add-on for Listen, an artist channel, or the homepage, then submit it for review.',
    productionPath: '/help/disco-widgets',
    sections: [
      {
        heading: '1. Build it',
        body: [
          'Use the @tahti/widget-sdk package in the tahti-org repository. packages/widget-sdk/README.md walks through the contract (what a widget exports, how it talks to the host page, and the size/security limits it runs under). packages/widget-sdk/example/live-status/ is a complete working example.',
          'A widget runs only inside a sandboxed iframe (no cookies, no parent DOM). It talks to the host with a small postMessage protocol: ready, init, resize, and same-origin open-link.',
        ],
      },
      {
        heading: '2. Open a pull request',
        body: [
          'Fork tahti-org and add your widget under contrib/disco-widgets/<your-widget-slug>/ — include src/index.ts, a short README describing the scope (listener, artist, or admin), and any config it expects.',
          'In the PR, say what it is for and give concrete steps a reviewer can follow to verify it (build the bundle, load it in the sandbox, confirm it renders with representative context).',
        ],
      },
      {
        heading: '3. What happens next',
        body: [
          'A maintainer reviews the code. Once merged, an admin builds the widget, publishes it through the Disco-widgets admin panel, and approves it. After that it is live in its store, credited to you.',
          'Install listener widgets from Settings → Add-ons → Discovery. Artists install channel widgets from Settings → Add-ons → Channel; they render on /channel/$slug and /u/$username.',
        ],
      },
    ],
  },
  {
    slug: 'support',
    title: 'Contact support',
    description:
      'Reach the Tahti team about your account, billing, or a technical issue.',
    productionPath: '/help/support',
    sections: [
      {
        heading: 'Get help',
        body: [
          'Use the form below for account, billing, engagement, or technical issues.',
          'Include a short description so the team can help quickly. Signed-in requests use your account email automatically.',
        ],
      },
    ],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
