/** Screenshot atlas + concrete flow cases for the Tahti map (`/more`).
 *
 * Old = production Tahti chrome (`public/map/{listen,studio,auth,settings}/`)
 * New = beta.tahti.live (`public/map/nuclear/`). Missing new shots show
 * "beta.tahti.live shot pending" rather than inventing pixels.
 */

export type MapShot = {
  /** Path under /map/… served from public/; omit when pending */
  image?: string;
  /** Route on that surface (prod or POC) */
  route: string;
  /** Short caption under the thumbnail */
  caption: string;
  /**
   * Surface has no equivalent view/route (not merely a pending screenshot).
   * Prefer setting `parity` on the case; this marks the empty pane.
   */
  absent?: boolean;
};

/** Whether both surfaces implement the view, or only one (parity gap). */
export type MapParity = 'both' | 'tahti-only' | 'nuclear-only';

export type MapCase = {
  id: string;
  /** Case title shown on the card */
  title: string;
  /** View / surface name */
  viewName: string;
  /** What situation this case covers */
  caption: string;
  action?: string;
  /**
   * Things you can do on this screen without navigating away — verified
   * against the Nuclear source (aria-labels, button text, real onClick
   * handlers), not guessed from the route name.
   */
  actions?: string[];
  /**
   * Real, verified in-app navigation targets from this screen — every
   * entry corresponds to an actual `<Link to="…">`/`navigate({ to: '…' })`
   * found in the Nuclear view's source, not the persistent chrome (the
   * AppShell sidebar and, on /studio/*, StudioNav — those reach nearly
   * every top-level section from anywhere and would clutter every single
   * diagram if included). An empty or missing list is itself a finding —
   * see NAVIGATION-GAPS.md.
   */
  goesTo?: { label: string; to: string }[];
  old: MapShot;
  new: MapShot;
  /** Explicit parity; inferred from shot.absent when omitted */
  parity?: MapParity;
};

function mermaidEscape(text: string): string {
  return text.replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

/** Soft-wrap a label onto multiple `<br/>` lines so wide text can't force
 * a node wider than its neighbours — the actual cause of the old
 * one-rank-per-node layout overlapping once a screen had more than ~5
 * actions/links (mermaid's dagre engine doesn't wrap node text itself). */
function wrapLabel(text: string, maxLineLen = 24): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLineLen && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines.join('<br/>');
}

/**
 * Small, focused flowchart for one screen: the screen at the top, with
 * in-page actions and outbound navigation grouped into their own labelled
 * subgraphs below it. Generated from the same `actions`/`goesTo` arrays
 * the accessible text lists render from, so the diagram and the text can
 * never drift apart — the diagram is a supplementary visual, the text
 * lists are the source of truth a screen reader can actually use.
 *
 * Grouping into subgraphs (rather than fanning every action/link off the
 * screen node as its own edge, as an earlier version did) keeps the graph
 * to at most two edges out of the screen node regardless of how many
 * actions or links a screen has — dagre lays out unconnected siblings
 * inside a subgraph as a clean stack, which is what actually stops nodes
 * and edge labels from overlapping on screens with many actions/links.
 */
export function caseFlowchart(c: MapCase): string {
  const screenId = 'screen';
  const actions = c.actions ?? [];
  const links = c.goesTo ?? [];
  const lines = [
    'flowchart TD',
    `  ${screenId}["${wrapLabel(mermaidEscape(c.viewName))}<br/><small>${mermaidEscape(c.new.route)}</small>"]:::screen`,
  ];

  if (actions.length) {
    lines.push('  subgraph acts["Things you can do"]', '    direction TB');
    actions.forEach((action, i) => {
      lines.push(`    a${i}["${wrapLabel(mermaidEscape(action))}"]:::action`);
    });
    lines.push('  end', `  ${screenId} --> acts`);
  }

  if (links.length) {
    lines.push('  subgraph nav["Where you can go"]', '    direction TB');
    links.forEach((link, i) => {
      lines.push(
        `    g${i}(["${wrapLabel(mermaidEscape(link.label))}<br/><small>${mermaidEscape(link.to)}</small>"]):::nav`,
      );
    });
    lines.push('  end', `  ${screenId} -.-> nav`);
  }

  if (!actions.length && !links.length) {
    lines.push(
      `  ${screenId} -.-> none["No verified in-page actions or outbound links found"]:::gap`,
    );
  }

  lines.push(
    'classDef screen fill:#eef4ff,stroke:#3b82f6,color:#1e3a8a,font-weight:bold;',
    'classDef action fill:#f3e8ff,stroke:#9333ea,color:#6b21a8;',
    'classDef nav fill:#ecfdf5,stroke:#10b981,color:#065f46;',
    'classDef gap fill:#fef2f2,stroke:#ef4444,color:#7f1d1d;',
  );
  return lines.join('\n');
}

/** Resolve whether a case exists on Tahti, Nuclear, or both. */
export function resolveCaseParity(c: MapCase): MapParity {
  if (c.parity) {
    return c.parity;
  }
  const tahtiAbsent = Boolean(c.old.absent);
  const nuclearAbsent = Boolean(c.new.absent);
  if (tahtiAbsent && !nuclearAbsent) {
    return 'nuclear-only';
  }
  if (!tahtiAbsent && nuclearAbsent) {
    return 'tahti-only';
  }
  return 'both';
}

export type MapCaseGroup = {
  id: string;
  title: string;
  description: string;
  cases: MapCase[];
};

/** @deprecated Prefer MAP_CASE_GROUPS — kept for any external imports */
export type MapScreen = {
  id: string;
  title: string;
  route: string;
  prodRoute: string;
  image: string;
  blurb: string;
};

export type MapScreenGroup = {
  id: string;
  title: string;
  description: string;
  screens: MapScreen[];
};

export const MAP_CASE_GROUPS: MapCaseGroup[] = [
  {
    id: 'anonymous',
    title: 'Anonymous listen',
    description:
      'Public discovery and playback without a session — home, live vs archive, chat join, subscribe gates, embeds.',
    cases: [
      {
        id: 'anon-home',
        title: 'Home / listen directory',
        viewName: 'Listen',
        caption: 'Anonymous lands on channel directory (search + genres).',
        actions: [
          'Search channels',
          'Filter by genre chip',
          'Preview-play a channel card',
          'Play Radio shortcut',
          'Open My Library shortcut',
        ],
        goesTo: [
          { label: 'Open a channel', to: '/channel/$slug' },
          { label: 'Open an artist profile', to: '/u/$username' },
          { label: 'Go to Radio', to: '/radio' },
        ],
        old: {
          image: '/map/listen/listen.png',
          route: '/listen',
          caption: 'Prod directory grid',
        },
        new: {
          image: '/map/nuclear/listen.png',
          route: '/',
          caption: 'Nuclear Listen hub',
        },
      },
      {
        id: 'anon-radio-online',
        title: 'Tahti Radio online',
        viewName: 'Radio',
        caption:
          'Co-op radio now-playing when the stream is up (always-on HLS).',
        actions: [
          'View now playing',
          'Browse programming schedule',
          'Play the always-on HLS stream',
        ],
        goesTo: [
          { label: 'Open the airing channel/show', to: '/channel/$slug' },
          { label: 'Open the show page', to: '/radio/show/$channelSlug' },
          { label: 'Open the DJ/artist profile', to: '/u/$username' },
        ],
        old: {
          image: '/map/listen/radio.png',
          route: '/radio',
          caption: 'Prod radio page',
        },
        new: {
          image: '/map/nuclear/radio.png',
          route: '/radio',
          caption: 'Nuclear radio + player bar',
        },
      },
      {
        id: 'anon-channel-live',
        title: 'Channel live',
        viewName: 'Channel',
        caption: 'Artist is broadcasting — LIVE badge, HLS live, public chat.',
        actions: [
          'Play the live HLS stream',
          'Read chat',
          'Post a chat message (anonymous handle)',
          'Browse pinned tracks',
          'Open the archive/catalog tab',
        ],
        goesTo: [
          {
            label: 'Open Subscribe (fan tier CTA)',
            to: '/subscribe/$username',
          },
          { label: 'Open the artist profile', to: '/u/$username' },
          { label: 'Back to Listen', to: '/' },
        ],
        old: {
          image: '/map/listen/channel-live.png',
          route: '/c/:slug (live)',
          caption: 'Prod LIVE channel',
        },
        new: {
          image: '/map/nuclear/channel.png',
          route: '/channel/$slug',
          caption: 'Nuclear channel (live or archive)',
        },
      },
      {
        id: 'anon-channel-offline',
        title: 'Channel offline / archive',
        viewName: 'Channel',
        caption: 'Not live — rotation / archive VOD, seekable player.',
        actions: [
          'Play an archive/rotation track',
          'Seek within the archive player',
          'Browse the catalog tab',
          'Read chat',
        ],
        goesTo: [
          {
            label: 'Open Subscribe (fan tier CTA)',
            to: '/subscribe/$username',
          },
          { label: 'Open the artist profile', to: '/u/$username' },
          { label: 'Back to Listen', to: '/' },
        ],
        old: {
          image: '/map/listen/channel.png',
          route: '/c/:slug (offline)',
          caption: 'Prod archive / offline',
        },
        new: {
          image: '/map/nuclear/channel.png',
          route: '/channel/$slug',
          caption: 'Same route; archive library tab',
        },
      },
      {
        id: 'anon-chat-join',
        title: 'Chat join (anonymous handle)',
        viewName: 'Channel chat',
        caption:
          'Join public chat with a handle + captcha; no account required.',
        actions: [
          'Set a nickname / captcha to join',
          'Post a message',
          'React to a message',
        ],
        goesTo: [
          {
            label: 'Open chat in sidebar toggles the rail — no route change',
            to: '/channel/$slug',
          },
        ],
        old: {
          image: '/map/listen/channel-live.png',
          route: '/c/:slug chat',
          caption: 'Prod channel chat rail',
        },
        new: {
          image: '/map/nuclear/channel-chat.png',
          route: '/chat/$slug / channel Chat tab',
          caption: 'Nuclear chat rail',
        },
      },
      {
        id: 'anon-profile',
        title: 'Artist profile',
        viewName: 'Profile',
        caption: 'Bio, tracks, collections — entry to subscribe and channel.',
        actions: [
          'Read bio + socials',
          'Switch profile section tabs (Catalog / Latest releases / Pinned)',
          'Follow the artist',
          'Play the featured track (hero player, with audio visualizer while playing)',
        ],
        goesTo: [
          { label: 'View channel (header text link)', to: '/channel/$slug' },
          { label: 'Open Subscribe', to: '/subscribe/$username' },
          { label: 'Open a collection', to: '/u/$username/c/$slug' },
          { label: 'Open a release smart link', to: '/r/$slug' },
          {
            label:
              'Open the green room, only shown on an upcoming show within its pre-live window',
            to: '/u/$username/green-room',
          },
        ],
        old: {
          image: '/map/listen/profile.png',
          route: '/u/:username',
          caption: 'Prod profile',
        },
        new: {
          image: '/map/nuclear/profile.png',
          route: '/u/$username',
          caption: 'Nuclear profile tabs',
        },
      },
      {
        id: 'anon-subscribe-gate',
        title: 'Subscribe gate (logged out)',
        viewName: 'Fan subscribe',
        caption:
          'Tier cards visible; checkout pushes join/login before Stripe.',
        actions: [
          'Compare fan tiers',
          'Start checkout (redirects to Join/Login first when logged out)',
        ],
        goesTo: [{ label: 'Back to the artist profile', to: '/u/$username' }],
        old: {
          image: '/map/listen/subscribe.png',
          route: '/u/:user/subscribe',
          caption: 'Prod tier cards',
        },
        new: {
          image: '/map/nuclear/subscribe.png',
          route: '/subscribe/$username',
          caption: 'Nuclear subscribe',
        },
      },
      {
        id: 'anon-smart-link',
        title: 'Smart link release',
        viewName: 'Smart link',
        caption: 'DSP landing for a release slug.',
        actions: [
          'Browse the release tracklist',
          'Click through to a DSP ("Listen on…")',
        ],
        goesTo: [
          { label: 'Open the artist profile', to: '/u/$username' },
          { label: 'Open the linked collection', to: '/u/$username/c/$slug' },
        ],
        old: {
          image: '/map/listen/smart-link.png',
          route: '/r/:slug',
          caption: 'Prod smart link',
        },
        new: {
          image: '/map/nuclear/smart-link.png',
          route: '/r/$slug',
          caption: 'Nuclear smart link',
        },
      },
      {
        id: 'anon-collection',
        title: 'Public collection',
        viewName: 'Collection',
        caption: 'Playlist / album page on the artist profile.',
        actions: [
          'Browse the tracklist',
          'Play the whole collection',
          'Play one track',
          'Open "Elsewhere" / "Linked releases" out-links',
        ],
        goesTo: [
          { label: 'Back to the artist profile', to: '/u/$username' },
          { label: 'Open a linked release smart link', to: '/r/$slug' },
          { label: 'Back to Listen', to: '/' },
        ],
        old: {
          image: '/map/listen/collection.png',
          route: '/u/:user/c/:slug',
          caption: 'Prod collection',
        },
        new: {
          image: '/map/nuclear/collection.png',
          route: '/u/$username/c/$slug',
          caption: 'Nuclear collection',
        },
      },
      {
        id: 'anon-embed',
        title: 'Embed player',
        viewName: 'Embed',
        caption: 'Minimal iframe chrome for channel / release embeds.',
        actions: [
          'Play/pause from the minimal iframe chrome',
          'Click through to the full release smart link',
        ],
        goesTo: [
          {
            label: 'Open the full release page (opens outside the iframe)',
            to: '/r/$slug',
          },
        ],
        old: {
          image: '/map/listen/embed.png',
          route: '/embed/c/:slug',
          caption: 'Prod embed',
        },
        new: {
          image: '/map/nuclear/embed.png',
          route: '/embed/c/$slug',
          caption: 'Nuclear embed',
        },
      },
      {
        id: 'anon-venues',
        title: 'Venues calendar',
        viewName: 'Venues',
        caption: 'Public venue list (register is a separate flow).',
        actions: ['Browse the venue directory'],
        goesTo: [
          { label: 'Open a venue detail page', to: '/v/$slug' },
          { label: 'Register a venue', to: '/venues/register' },
          { label: 'Back to the map hub', to: '/more' },
        ],
        old: {
          image: '/map/listen/venues.png',
          route: '/venues',
          caption: 'Prod venues',
        },
        new: {
          image: '/map/nuclear/venues.png',
          route: '/venues',
          caption: 'Nuclear venues',
        },
      },
      {
        id: 'anon-transparency-status',
        title: 'Transparency + status',
        viewName: 'Trust pages',
        caption: 'YTD / grants transparency and platform health.',
        actions: [
          'Browse the latest ledger entries (amount, category, state, when)',
          'Read the published-as attribution',
        ],
        goesTo: [
          {
            label: 'Open the full transparency methodology',
            to: '/transparency/methodology',
          },
          { label: 'Back to the map hub', to: '/more' },
        ],
        old: {
          image: '/map/listen/transparency.png',
          route: '/transparency, /status',
          caption: 'Prod transparency',
        },
        new: {
          image: '/map/nuclear/transparency.png',
          route: '/transparency, /status',
          caption: 'Nuclear transparency (status shot separate)',
        },
      },
      {
        id: 'anon-help',
        title: 'Help center',
        viewName: 'Help',
        caption: 'Help index and articles.',
        actions: ['Browse help categories', 'Open a help article'],
        goesTo: [
          { label: 'Open a specific article', to: '/help/$slug' },
          { label: 'Back to the map hub', to: '/more' },
        ],
        old: {
          image: '/map/listen/help.png',
          route: '/help',
          caption: 'Prod help',
        },
        new: {
          image: '/map/nuclear/help.png',
          route: '/help',
          caption: 'Nuclear help hub',
        },
      },
    ],
  },
  {
    id: 'auth',
    title: 'Auth',
    description:
      'Account entry: join, email verify, login, optional TOTP step.',
    cases: [
      {
        id: 'auth-join',
        title: 'Join / register',
        viewName: 'Join',
        caption:
          'You can create an artist account with your email, artist name, username, and a confirmed password.',
        actions: [
          'Fill in email, artist name, username, and a confirmed password',
          'Submit to create an account',
        ],
        goesTo: [{ label: 'After submit, land on Verify', to: '/verify' }],
        old: {
          image: '/map/auth/join.png',
          route: '/join',
          caption: 'Prod join',
        },
        new: {
          image: '/map/nuclear/join.png',
          route: '/join',
          caption: 'Nuclear join',
        },
      },
      {
        id: 'auth-verify',
        title: 'Verify email token',
        viewName: 'Verify',
        caption: 'Landing from email magic/token link.',
        actions: [
          'Land here from the emailed verification link (GET /api/auth/verify)',
        ],
        goesTo: [
          { label: 'Re-request from Join if the link expired', to: '/join' },
          { label: 'Continue to Login once verified', to: '/login' },
        ],
        old: {
          image: '/map/auth/verify.png',
          route: '/verify',
          caption: 'Prod verify',
        },
        new: {
          image: '/map/nuclear/verify.png',
          route: '/verify',
          caption: 'Nuclear verify',
        },
      },
      {
        id: 'auth-login',
        title: 'Login',
        viewName: 'Login',
        caption: 'Session cookie via /tahti-api (host-only on beta).',
        actions: ['Enter email + password', 'Submit to start a session'],
        goesTo: [
          { label: 'Land on Listen home once logged in', to: '/' },
          {
            label: 'TOTP step appears in-place when 2FA is enabled',
            to: '/login (TOTP step)',
          },
        ],
        old: {
          image: '/map/auth/login.png',
          route: '/login',
          caption: 'Prod login',
        },
        new: {
          image: '/map/nuclear/login.png',
          route: '/login',
          caption: 'Nuclear login',
        },
      },
      {
        id: 'auth-totp',
        title: 'Login + TOTP',
        viewName: 'Login (2FA)',
        caption: 'When TOTP enabled, second factor after password.',
        actions: ['Enter the 6-digit TOTP code from an authenticator app'],
        goesTo: [{ label: 'Land on Listen home once verified', to: '/' }],
        old: {
          image: '/map/auth/login.png',
          route: '/login (TOTP step)',
          caption: 'Same form; TOTP field when required',
        },
        new: {
          image: '/map/nuclear/login-totp.png',
          route: '/login (TOTP step)',
          caption:
            'Nuclear TOTP step — lives in the AuthDialog modal (opened by /login), not a full-page route.',
        },
      },
    ],
  },
  {
    id: 'listener',
    title: 'Listener / member',
    description:
      'Logged-in listener: library, fan subscribe checkout, DMs, governance vote vs forbidden.',
    cases: [
      {
        id: 'listener-library',
        title: 'Library / follows',
        viewName: 'Library',
        caption:
          'Follows and owned sounds after login — Favorites/History live under Listen, not Library.',
        actions: [
          'Search every owned/followed sound',
          'Filter by visibility or processing state',
          'Play a track',
          'Edit metadata',
          'Open the audio editor',
          'Switch Collections / Recordings / Releases tabs',
        ],
        goesTo: [
          {
            label: 'Open the audio editor for a track',
            to: '/studio/sounds/$id/editor',
          },
          { label: 'Open Favorites', to: '/listen/favorites' },
          { label: 'Open History', to: '/listen/history' },
        ],
        old: {
          image: '/map/auth/listener-dashboard.png',
          route: '/dashboard (free listener)',
          caption: 'Prod free listener dashboard',
        },
        new: {
          image: '/map/nuclear/library.png',
          route: '/library',
          caption:
            'You can search every owned sound, filter by visibility or processing state, play it, edit metadata, or open the audio editor.',
        },
      },
      {
        id: 'listener-subscribe-checkout',
        title: 'Fan subscribe checkout',
        viewName: 'Subscribe',
        caption: 'Logged-in fan picks a tier → Stripe checkout URL.',
        actions: ['Pick a fan tier', 'Continue to Stripe checkout'],
        goesTo: [{ label: 'Back to the artist profile', to: '/u/$username' }],
        old: {
          image: '/map/listen/subscribe.png',
          route: '/u/:user/subscribe',
          caption: 'Prod tiers → Stripe',
        },
        new: {
          image: '/map/nuclear/subscribe.png',
          route: '/subscribe/$username',
          caption: 'Nuclear checkout handoff',
        },
      },
      {
        id: 'listener-dms',
        title: 'DMs / messages',
        viewName: 'Messages',
        caption: 'Inbox + thread for artist ↔ fan messages.',
        actions: ['Read a message thread', 'Send a reply'],
        goesTo: [{ label: 'Open a specific thread', to: '/messages/$id' }],
        old: {
          image: '/map/auth/listener-dashboard.png',
          route: '/dashboard/messages',
          caption: 'Prod messages (via dashboard)',
        },
        new: {
          image: '/map/nuclear/listener-dashboard.png',
          route: '/messages',
          caption: 'Nuclear DMs (in My Library, not a separate dashboard)',
        },
      },
      {
        id: 'listener-gov-member',
        title: 'Governance vote (member)',
        viewName: 'Governance',
        caption: '€40 member can browse motions and cast YES/NO/ABSTAIN.',
        actions: [
          'Browse motions',
          'Cast a YES/NO/ABSTAIN vote',
          'Comment on a motion',
          'Submit a feature request',
        ],
        goesTo: [
          {
            label: 'Open feature requests',
            to: '/governance/feature-requests',
          },
          {
            label: 'Open public motion history',
            to: '/governance/history',
          },
          {
            label: 'Open historical grant reports',
            to: '/transparency/grants/$year',
          },
        ],
        old: {
          image: '/map/auth/governance-member.png',
          route: '/governance',
          caption: 'Prod member governance',
        },
        new: {
          image: '/map/nuclear/governance.png',
          route: '/governance',
          caption: 'Nuclear motions list',
        },
      },
      {
        id: 'listener-gov-forbidden',
        title: 'Governance forbidden (non-member)',
        viewName: 'Governance',
        caption: 'Logged-in free listener is gated — no vote UI.',
        actions: ['Read the membership-required gate message'],
        goesTo: [
          {
            label: 'Upsell target: fan subscribe / membership',
            to: '/subscribe/$username',
          },
        ],
        old: {
          image: '/map/auth/governance.png',
          route: '/governance (gated)',
          caption: 'Prod gate / upsell',
        },
        new: {
          image: '/map/nuclear/governance.png',
          route: '/governance (gated)',
          caption: 'Nuclear gated state (same route)',
        },
      },
      {
        id: 'listener-member-home',
        title: 'Member dashboard',
        viewName: 'Member home',
        caption:
          'Member overview after login (prod dashboard vs Nuclear listen).',
        actions: [
          'Same actions as the anonymous Listen hub, plus session-aware chrome (Library, Messages, Studio in the sidebar)',
        ],
        goesTo: [
          { label: 'Open Library', to: '/library' },
          { label: 'Open Messages', to: '/messages' },
          {
            label: 'Open Studio (if the account has a channel)',
            to: '/studio',
          },
        ],
        old: {
          image: '/map/auth/member-dashboard.png',
          route: '/dashboard',
          caption: 'Prod member dashboard',
        },
        new: {
          image: '/map/nuclear/listen.png',
          route: '/',
          caption: 'Nuclear defaults to Listen shell',
        },
      },
    ],
  },
  {
    id: 'artist',
    title: 'Artist studio',
    description:
      'Channel owner tools: home, go-live, upload, stash, collections, stats, sources, revenue, design.',
    cases: [
      {
        id: 'artist-home',
        title: 'Studio home',
        viewName: 'Studio',
        caption:
          'You can review clickable audience totals, start or schedule a broadcast, and open every catalog and channel tool.',
        actions: [
          'Review clickable audience totals',
          'Go Live shortcut',
          'Jump to Music / Broadcast quick links',
          'Open any Studio tool from the persistent StudioNav sidebar',
        ],
        goesTo: [
          { label: 'Go Live', to: '/studio/go-live' },
          { label: 'Open Sounds', to: '/studio/sounds' },
          { label: 'Open Channel design', to: '/studio/channel' },
          {
            label: 'If no channel yet, land on setup',
            to: '/studio/channel?tab=setup',
          },
        ],
        old: {
          image: '/map/studio/home.png',
          route: '/dashboard',
          caption: 'Prod dashboard',
        },
        new: {
          image: '/map/nuclear/studio.png',
          route: '/studio',
          caption: 'Nuclear studio hub',
        },
      },
      {
        id: 'artist-setup-channel',
        title: 'Channel setup and design',
        viewName: 'Channel',
        caption:
          'Create a channel, then continue directly into its profile, visual design, radio, and domain settings.',
        actions: [
          'Create a channel',
          'Continue directly into profile / visual design / radio / domain settings (same view, no separate wizard route)',
        ],
        goesTo: [
          { label: 'Land on Studio home once a channel exists', to: '/studio' },
        ],
        old: {
          image: '/map/studio/setup-channel.png',
          route: '/dashboard/setup-channel',
          caption: 'Prod setup wizard',
        },
        new: {
          image: '/map/nuclear/setup-channel-gated.png',
          route: '/studio/channel?tab=setup',
          caption: 'Nuclear combines channel setup and design',
        },
      },
      {
        id: 'artist-go-live',
        title: 'Go Live wizard',
        viewName: 'Go Live',
        caption: 'OBS/Icecast keys → signal check → go live → multistream.',
        actions: [
          'Copy OBS/Icecast encoder credentials',
          'Regenerate the stream key',
          'Watch signal meters',
          'Toggle auto-record / auto-publish',
          'Add a multistream destination',
          'Go live',
          'Open recordings',
        ],
        goesTo: [
          {
            label: 'Open recordings once broadcasting',
            to: '/studio/recordings',
          },
          {
            label: 'Open the public channel page once live',
            to: '/channel/$slug',
          },
        ],
        old: {
          image: '/map/studio/go-live-wizard.png',
          route: '/dashboard/broadcast',
          caption: 'Prod broadcast studio',
        },
        new: {
          image: '/map/nuclear/go-live.png',
          route: '/studio/go-live',
          caption:
            'You can monitor the signal, go live, record the broadcast, copy encoder credentials, and manage multistream destinations.',
        },
      },
      {
        id: 'artist-upload',
        title: 'Upload',
        viewName: 'Upload',
        caption: 'prepare → PUT → complete (mock offline supported).',
        actions: [
          'Pick or drag-drop a file',
          'Give it an optional title',
          'Upload',
        ],
        goesTo: [
          {
            label:
              "On success, navigates straight to the new track's detail page (as of this session — previously stayed on this form)",
            to: '/studio/sounds/$id',
          },
          {
            label: 'Open Add-ons → Import for cloud imports instead',
            to: '/settings/plugin-store?category=import',
          },
        ],
        old: {
          image: '/map/studio/upload.png',
          route: '/dashboard/upload',
          caption: 'Prod upload',
        },
        new: {
          image: '/map/nuclear/upload.png',
          route: '/studio/upload',
          caption: 'Nuclear upload',
        },
      },
      {
        id: 'artist-archive',
        title: 'Music / Sounds',
        viewName: 'Sounds',
        caption: 'Catalog list — play, meta, delete, open editor.',
        actions: [
          'Search / sort the track list',
          'Play a track',
          'Open the track editor',
          'More menu: pin to Stage / add to 24/7 rotation / add to playlist / view insights / delete',
        ],
        goesTo: [
          { label: "Open a track's detail page", to: '/studio/sounds/$id' },
          {
            label: 'Open the audio editor for a track',
            to: '/studio/sounds/$id/editor',
          },
        ],
        old: {
          image: '/map/studio/archive.png',
          route: '/dashboard/archive',
          caption: 'Prod music archive',
        },
        new: {
          image: '/map/nuclear/archive.png',
          route: '/studio/sounds',
          caption: 'Nuclear archive',
        },
      },
      {
        id: 'artist-archive-item',
        title: 'Music / track detail',
        viewName: 'Sound',
        caption:
          'Single-track page reached from Upload or Sounds — polls PENDING/PROCESSING until READY (added this session), then unlocks playback and editing; ERROR shows a banner instead.',
        actions: [
          'Play / pause the track (disabled until READY)',
          'Add to or remove from 24/7 rotation',
          'Pin to page, up to the pinned-track limit',
          'Switch between the Details and Playlists tabs',
          'Edit title, description, genre, visibility, downloads/comments toggles',
          'Save changes',
          'Normalize the waveform (disabled until READY)',
          'Auto-trim silence (disabled until READY)',
          'Download or activate an older revision from Revision history',
          'Add the track to one or more playlists',
        ],
        goesTo: [
          { label: 'Back to Sounds list', to: '/studio/sounds' },
          {
            label: 'Open track insights',
            to: '/studio/insights/$kind/$id',
          },
          {
            label: 'Open the audio editor (disabled until READY)',
            to: '/studio/sounds/$id/editor',
          },
        ],
        old: {
          route: '/dashboard/archive',
          caption:
            'No single-track detail page in prod — edits happen inline in the list.',
          absent: true,
        },
        new: {
          route: '/studio/sounds/$id',
          caption: 'Nuclear track detail — shot pending',
        },
      },
      {
        id: 'artist-stash',
        title: 'Stash',
        viewName: 'Stash',
        caption: 'Private locker — not public on channel.',
        actions: [
          'Upload to stash (private, cloud-import staging)',
          'Promote a stash file into Music',
        ],
        old: {
          image: '/map/studio/stash.png',
          route: '/dashboard/stash',
          caption: 'Prod stash',
        },
        new: {
          image: '/map/nuclear/stash.png',
          route: '/studio/stash',
          caption: 'Nuclear stash',
        },
      },
      {
        id: 'artist-collections',
        title: 'Collections / album designer',
        viewName: 'Collections',
        caption: 'Create playlist/album, add/reorder/remove tracks.',
        actions: [
          'Create a collection',
          'Search collections',
          'Filter by type / visibility',
          "Open a collection's editor or playlist editor",
        ],
        goesTo: [
          {
            label: "Open an album/EP collection's Design editor",
            to: '/studio/collections/$slug',
          },
          {
            label: "Open a playlist/DJ-set collection's editor",
            to: '/studio/playlists/$slug',
          },
        ],
        old: {
          image: '/map/studio/collections.png',
          route: '/dashboard/collections',
          caption: 'Prod collections',
        },
        new: {
          image: '/map/nuclear/collections.png',
          route: '/studio/collections',
          caption: 'Nuclear collections',
        },
      },
      {
        id: 'artist-releases',
        title: 'Releases / smart links',
        viewName: 'Releases',
        caption: 'Smart-link catalog + DSP targets.',
        actions: [
          'Create a release',
          'Add tracks',
          'Set smart-link DSP targets',
          'Open the public link',
          'Open distribution status',
        ],
        goesTo: [
          { label: "Open a release's detail page", to: '/studio/releases/$id' },
          { label: 'View the public smart link', to: '/r/$slug' },
          { label: 'Open distribution', to: '/studio/distribution' },
        ],
        old: {
          image: '/map/studio/releases.png',
          route: '/dashboard/releases',
          caption: 'Prod releases',
        },
        new: {
          image: '/map/nuclear/releases.png',
          route: '/studio/releases',
          caption: 'Nuclear releases',
        },
      },
      {
        id: 'artist-stats',
        title: 'Stats overview',
        viewName: 'Stats',
        caption: 'Plays, top tracks, countries summary.',
        actions: [
          'Compare audience and broadcast metrics',
          'Explore listener countries on a world map',
          'Open per-track insights',
        ],
        goesTo: [
          {
            label: "Open a track's insights detail",
            to: '/studio/insights/$kind/$id',
          },
          { label: "Open a track's catalog entry", to: '/studio/sounds/$id' },
          {
            label: 'Open Revenue for money-side metrics',
            to: '/studio/revenue',
          },
        ],
        old: {
          image: '/map/studio/stats.png',
          route: '/dashboard/stats',
          caption: 'Prod stats',
        },
        new: {
          image: '/map/nuclear/stats.png',
          route: '/studio/stats',
          caption:
            'You can compare audience and broadcast metrics, explore listener countries on a world map, and open per-track insights.',
        },
      },
      {
        id: 'artist-stats-detail',
        title: 'Track insights',
        viewName: 'Track insights',
        caption: 'Drill-down for a track and period.',
        actions: [
          "Compare a track's plays and downloads over time",
          'See its audience on the listener world map',
        ],
        goesTo: [
          { label: 'Back to Sounds', to: '/studio/sounds' },
          {
            label: 'Back to Releases (when the source is a release track)',
            to: '/studio/releases',
          },
        ],
        old: {
          image: '/map/studio/stats-detail.png',
          route: '/dashboard/stats (detail)',
          caption: 'Prod stats detail',
        },
        new: {
          image: '/map/nuclear/stats-detail.png',
          route: '/studio/insights/sound/:id',
          caption:
            'You can compare a track’s plays and downloads over time and see its audience on the listener world map.',
        },
      },
      {
        id: 'artist-sources',
        title: 'Import add-ons',
        viewName: 'Settings → Add-ons → Import',
        caption:
          'Bandcamp, SoundCloud, Google Drive, Mixcloud, hearthis.at — each configures inline (Connect/Configure gear), no separate page.',
        actions: [
          'Connect Bandcamp / SoundCloud / Google Drive / Mixcloud',
          'Enter a hearthis.at username to browse its library',
          'Pick an import destination playlist',
          'Preview a source track before importing',
        ],
        goesTo: [
          {
            label: 'Land in Sounds once an import completes',
            to: '/studio/sounds/$id',
          },
          {
            label: 'Land in Collections when importing into a playlist',
            to: '/studio/collections/$slug',
          },
        ],
        old: {
          image: '/map/settings/connections.png',
          route: '/dashboard/settings/connections',
          caption: 'Prod connections / sources',
        },
        new: {
          image: '/map/nuclear/sources.png',
          route: '/settings/plugin-store?category=import',
          caption: 'Add-ons → Import tiles',
        },
      },
      {
        id: 'artist-revenue',
        title: 'Revenue / Connect',
        viewName: 'Revenue',
        caption: 'Stripe Connect status + grant estimate/history.',
        actions: [
          'Connect Stripe',
          'View fan tiers',
          'Edit tier pricing',
          'View payouts',
          'Open the Stripe portal (external — window.open)',
        ],
        old: {
          image: '/map/studio/revenue.png',
          route: '/dashboard/revenue',
          caption: 'Prod revenue',
        },
        new: {
          image: '/map/nuclear/revenue.png',
          route: '/studio/revenue',
          caption: 'Nuclear revenue',
        },
      },
      {
        id: 'artist-channel-design',
        title: 'Channel design',
        viewName: 'Channel design',
        caption: 'Look, presets, accent — also owner Design tab on profile.',
        actions: [
          'Pick a visual preset',
          'Pick a brand accent',
          'Pick a header style',
          'Configure gallery / slideshow',
          'Toggle public chat',
          'Toggle free subscriptions',
          'Preview live',
        ],
        goesTo: [
          { label: 'Open the public channel to preview', to: '/channel/$slug' },
          { label: 'Open the public profile', to: '/u/$username' },
        ],
        old: {
          image: '/map/studio/channel.png',
          route: '/dashboard/channel/edit',
          caption: 'Prod channel appearance',
        },
        new: {
          image: '/map/nuclear/channel-design.png',
          route: '/studio/channel',
          caption: 'Nuclear channel designer',
        },
      },
      {
        id: 'artist-schedule',
        title: 'Schedule / programme',
        viewName: 'Schedule',
        caption: 'Next show + programme / fallback toggles.',
        actions: [
          'Book a Tahti Radio slot',
          'Cancel a booking',
          'Clear a planned time',
          'Open the booking calendar',
        ],
        goesTo: [
          {
            label: 'Open Channel design for rotation/fallback settings',
            to: '/studio/channel',
          },
        ],
        old: {
          image: '/map/studio/schedule.png',
          route: '/dashboard/schedule',
          caption: 'Prod schedule',
        },
        new: {
          image: '/map/nuclear/schedule.png',
          route: '/studio/schedule',
          caption: 'Nuclear schedule',
        },
      },
      {
        id: 'artist-updates',
        title: 'Updates / newsletter',
        viewName: 'Updates',
        caption: 'Posts + compose/send newsletter.',
        actions: [
          'Create a new post or draft',
          'Delete a post',
          'Compose/send a newsletter',
        ],
        old: {
          image: '/map/studio/updates.png',
          route: '/dashboard/newsletter',
          caption: 'Prod newsletter',
        },
        new: {
          image: '/map/nuclear/updates.png',
          route: '/studio/updates',
          caption: 'Nuclear updates',
        },
      },
      {
        id: 'artist-editor',
        title: 'Audio editor',
        viewName: 'Editor',
        caption: 'Waveform cut/trim, EQ, stems, draft/render.',
        actions: [
          'Cut/trim on the waveform',
          'Adjust EQ / compression / limiter',
          'Add markers',
          'Split stems',
          'Save a draft or render a new version',
        ],
        goesTo: [
          { label: 'Back to Sounds', to: '/studio/sounds' },
          {
            label: "Open a specific track's standalone editor route",
            to: '/studio/sounds/$id/editor',
          },
        ],
        old: {
          image: '/map/studio/editor.png',
          route: '/dashboard/editor',
          caption: 'Prod editor',
        },
        new: {
          image: '/map/nuclear/editor.png',
          route: '/studio/editor',
          caption: 'Nuclear editor',
        },
      },
      {
        id: 'artist-settings',
        title: 'Settings (account / artist / money)',
        viewName: 'Settings',
        caption: 'Account, artist info, fan tiers, connections.',
        actions: [
          'Edit account details',
          'Edit artist profile (bio/socials/avatar)',
          'Manage fan tiers',
          'Manage source connections',
          'Switch settings sections',
        ],
        goesTo: [
          { label: 'Open Money settings', to: '/settings/money' },
          { label: 'Open Green room settings', to: '/settings/broadcast' },
        ],
        old: {
          image: '/map/settings/account.png',
          route: '/dashboard/settings/*',
          caption: 'Prod settings account',
        },
        new: {
          image: '/map/nuclear/settings.png',
          route: '/settings/$section',
          caption: 'Nuclear settings sections',
        },
      },
      {
        id: 'artist-money-tiers',
        title: 'Fan tiers / money',
        viewName: 'Money',
        caption: 'Configure fan subscription tiers + Connect.',
        actions: [
          'Create/edit a fan tier',
          'Set tier pricing',
          'Reorder tiers',
        ],
        goesTo: [
          {
            label:
              'Open fan subscription performance (same route, different tab)',
            to: '/settings/money',
          },
        ],
        old: {
          image: '/map/settings/money-tiers.png',
          route: '/dashboard/settings/fan-subs',
          caption: 'Prod fan-subs settings',
        },
        new: {
          image: '/map/nuclear/money-tiers.png',
          route: '/settings/money',
          caption: 'Nuclear fan tiers',
        },
      },
      {
        id: 'artist-money-fan-subs',
        title: 'Fan subscription performance',
        viewName: 'Fan subscriptions',
        caption:
          'You can review active subscribers, monthly and yearly net revenue, payout health and transfer history, then export the subscriber list.',
        actions: [
          'Review active subscribers',
          'Compare monthly and yearly net revenue',
          'Check payout health and transfer history',
          'Export the subscriber list',
        ],
        goesTo: [
          {
            label: 'Open fan tier configuration (same route, different tab)',
            to: '/settings/money',
          },
        ],
        old: {
          image: '/map/settings/money.png',
          route: '/dashboard/settings/fan-subs',
          caption: 'Prod fan subscription performance',
        },
        new: {
          image: '/map/nuclear/money-fan-subs.png',
          route: '/settings/money',
          caption: 'Nuclear fan subscription performance',
        },
      },
    ],
  },
  {
    id: 'recent-beta-views',
    title: 'Recently ported beta views',
    description:
      'Screens added or substantially changed in the latest Tahti parity work. Use each card’s explanation and Mermaid graph to review what the view does and where it leads.',
    cases: [
      {
        id: 'artist-channel-radio',
        title: 'Studio Radio management',
        viewName: 'Studio Channel · Radio',
        caption:
          'Manage the channel stream, 24/7 rotation, announcements, pinned announcements, and Tahti Radio submissions.',
        actions: [
          'Start, stop, or listen to the channel stream',
          'Review and reorder the 24/7 rotation',
          'Create channel announcements and pinned announcements',
          'Submit up to five tracks to Tahti Radio',
        ],
        goesTo: [
          { label: 'Open channel design', to: '/studio/channel' },
          { label: 'Open Go Live', to: '/studio/go-live' },
          { label: 'Open the Sounds library', to: '/studio/sounds' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct production equivalent',
        },
        new: {
          image: '/map/nuclear/studio-channel-radio.png',
          route: '/studio/channel?tab=radio',
          caption: 'Channel radio controls',
        },
      },
      {
        id: 'artist-channel-announcements',
        title: 'Channel announcements',
        viewName: 'Announcements',
        caption:
          'Publish channel updates and manage the smaller set of announcements that should remain pinned.',
        actions: [
          'Publish an announcement',
          'Pin or unpin an announcement',
          'Remove an outdated pinned announcement',
        ],
        goesTo: [
          {
            label: 'Return to Radio controls',
            to: '/studio/channel?tab=radio',
          },
          { label: 'Open the public channel', to: '/channel/$slug' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct production equivalent',
        },
        new: {
          image: '/map/nuclear/studio-channel-announcements.png',
          route: '/studio/channel?tab=announcements',
          caption: 'Announcements editor',
        },
      },
      {
        id: 'artist-channel-tahti-radio',
        title: 'Tahti Radio submissions',
        viewName: 'Tahti Radio',
        caption:
          'Choose individual library tracks for consideration in the shared Tahti Radio rotation and follow their review state.',
        actions: [
          'Select up to five tracks from the library',
          'Add an optional submission note',
          'Enable or disable channel participation',
          'Review pending, approved, or rejected results',
        ],
        goesTo: [
          { label: 'Browse Sounds', to: '/studio/sounds' },
          {
            label: 'Return to Radio controls',
            to: '/studio/channel?tab=radio',
          },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct production equivalent',
        },
        new: {
          image: '/map/nuclear/studio-channel-tahti-radio.png',
          route: '/studio/channel?tab=tahti-radio',
          caption: 'Tahti Radio submission panel',
        },
      },
      {
        id: 'artist-governance',
        title: 'Artist governance',
        viewName: 'Studio Governance',
        caption:
          'Review member-gated motions and participate in the artist governance workflow.',
        actions: [
          'Review active motions',
          'Read discussion and context',
          'Vote when eligible',
          'Submit a feature request',
        ],
        goesTo: [
          { label: 'Open Studio home', to: '/studio' },
          { label: 'Open account settings', to: '/settings/account' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct production equivalent',
        },
        new: {
          image: '/map/nuclear/studio-governance.png',
          route: '/studio/governance',
          caption: 'Governance workspace',
        },
      },
      {
        id: 'artist-events',
        title: 'Artist events',
        viewName: 'Studio Events',
        caption:
          'Review scheduled events, see venue details, and open the dedicated event creation flow.',
        actions: [
          'Browse event cards and thumbnails',
          'Open event details',
          'Open a venue from the directory',
          'Create a new event',
        ],
        goesTo: [
          { label: 'Open the new event page', to: '/studio/events/new' },
          { label: 'Open the Studio schedule', to: '/studio/schedule' },
          { label: 'Open venues', to: '/studio/venues' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct production equivalent',
        },
        new: {
          image: '/map/nuclear/studio-events.png',
          route: '/studio/events',
          caption: 'Events listing',
        },
      },
      {
        id: 'artist-event-new',
        title: 'Create an event',
        viewName: 'New Event',
        caption:
          'Create an event as a dedicated page, with a thumbnail, venue, ticket link, and show metadata.',
        actions: [
          'Add event title and description',
          'Choose or create a venue',
          'Attach a ticket link',
          'Save the event',
        ],
        goesTo: [
          { label: 'Return to Events', to: '/studio/events' },
          { label: 'Open the schedule', to: '/studio/schedule' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct production equivalent',
        },
        new: {
          image: '/map/nuclear/studio-event-new.png',
          route: '/studio/events/new',
          caption: 'Dedicated event form',
        },
      },
      {
        id: 'admin-vendors',
        title: 'Admin vendors overview',
        viewName: 'Admin · Vendors',
        caption:
          'Review critical and integration vendors, distribution state, and DPA tracking from the admin overview.',
        actions: [
          'Review critical vendor status',
          'Review integration vendors',
          'Check DPA indicators',
        ],
        goesTo: [
          { label: 'Return to Admin overview', to: '/admin' },
          { label: 'Open platform status', to: '/admin/status' },
          { label: 'Open Admin logs', to: '/admin/logs' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct Nuclear-era capture',
        },
        new: {
          image: '/map/nuclear/admin-vendors.png',
          route: '/admin/vendors',
          caption: 'Vendor and DPA overview',
        },
      },
      {
        id: 'admin-disco-widgets',
        title: 'Admin widget catalog',
        viewName: 'Admin · Disco Widgets',
        caption:
          'Manage the available discovery widgets and their parameters, artwork, placement, and lifecycle.',
        actions: [
          'Filter widgets by audience',
          'Register a widget in a modal',
          'Edit widget parameters and cover art',
          'Delete a widget after confirmation',
        ],
        goesTo: [
          { label: 'Return to Admin overview', to: '/admin' },
          { label: 'Open the listener home', to: '/' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct Nuclear-era capture',
        },
        new: {
          image: '/map/nuclear/admin-disco-widgets.png',
          route: '/admin/disco-widgets',
          caption: 'Widget catalog and editor',
        },
      },
      {
        id: 'admin-status',
        title: 'Admin platform status',
        viewName: 'Admin · Status',
        caption:
          'Inspect platform health, queue health, cron jobs, and service status from one admin view.',
        actions: [
          'Review service health',
          'Inspect queue health',
          'Inspect cron jobs',
          'Check platform version and uptime',
        ],
        goesTo: [
          { label: 'Return to Admin overview', to: '/admin' },
          { label: 'Open Admin logs', to: '/admin/logs' },
          { label: 'Open stream management', to: '/admin/streams' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct Nuclear-era capture',
        },
        new: {
          image: '/map/nuclear/admin-status.png',
          route: '/admin/status',
          caption: 'Platform and service status',
        },
      },
      {
        id: 'account-notifications',
        title: 'Account notifications',
        viewName: 'Settings · Notifications',
        caption:
          'Control notification delivery and profile visibility without leaving Account settings.',
        actions: [
          'Toggle money-movement notifications',
          'Toggle listener-activity and weekly recap notifications',
          'Control follower, following, listener, and chat visibility',
          'Save notification preferences',
        ],
        goesTo: [
          { label: 'Open account security', to: '/settings/account' },
          { label: 'Open artist settings', to: '/settings/artist' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct Nuclear-era capture',
        },
        new: {
          image: '/map/nuclear/settings-notifications.png',
          route: '/settings/account · Notifications tab',
          caption: 'Account notification and visibility controls',
        },
      },
      {
        id: 'tahti-jam',
        title: 'Tahti Jam',
        viewName: 'Jam',
        caption:
          'Host-authoritative synced group listening — join a playlist jam by code or link, see who else is jamming, and hear the same track at the same position as the host.',
        actions: [
          'Start a Jam from a playlist (host)',
          'Join a Jam by code or shared link',
          'Copy the invite link',
          'See the live participant list',
          'Leave the Jam',
          'End the Jam for everyone (host only)',
        ],
        goesTo: [
          { label: 'Start a Jam from a playlist', to: '/u/$username/c/$slug' },
        ],
        old: {
          absent: true,
          route: '—',
          caption: 'No production equivalent',
        },
        new: {
          route: '/jam/$code',
          caption:
            "Nuclear-only group listening — shot pending. Backend is Redis pub/sub (SSE fan-out survives multiple API instances) with a full playable snapshot per track, so a guest's own player streams in sync rather than just showing a status readout.",
        },
      },
      {
        id: 'admin-artwork-presets',
        title: 'Artwork presets',
        viewName: 'Admin · Artwork presets',
        caption:
          'The 16 built-in placeholder covers used when an upload has no artwork of its own — protected defaults plus a per-slot assignable pool of uploaded custom artwork.',
        actions: [
          'Select a default artwork slot to edit',
          'Assign a previously-uploaded custom artwork to a slot',
          'Upload a new artwork (hover the preview, or the + tile)',
          'Save presets',
          'Reset all slots back to their defaults',
        ],
        goesTo: [{ label: 'Return to Admin overview', to: '/admin' }],
        old: {
          absent: true,
          route: '—',
          caption: 'No direct Nuclear-era capture',
        },
        new: {
          route: '/admin/artwork-presets',
          caption:
            'Defaults are immutable — a slot shows a custom artwork instead of overwriting the built-in one, saved per signed-in admin — shot pending.',
        },
      },
    ],
  },
  {
    id: 'edge',
    title: 'Edge / gate cases',
    description:
      'Payments not ready, studio without login, radio offline badge vs always-on HLS.',
    cases: [
      {
        id: 'edge-payments-not-ready',
        title: 'Payments not ready',
        viewName: 'Revenue / subscribe',
        caption:
          'Connect incomplete or Stripe not configured — checkout / payouts blocked.',
        actions: [
          'See the "Connect incomplete" state instead of live payout figures',
          'Start/retry Stripe Connect onboarding',
        ],
        old: {
          image: '/map/studio/revenue.png',
          route: '/dashboard/revenue',
          caption: 'Prod Connect incomplete state',
        },
        new: {
          image: '/map/nuclear/revenue.png',
          route: '/studio/revenue',
          caption: 'Nuclear revenue',
        },
      },
      {
        id: 'edge-studio-logged-out',
        title: 'Studio while not logged in',
        viewName: 'Studio gate',
        caption: 'Visiting /studio without session → login / join prompt.',
        actions: ['Redirected straight to the login form'],
        goesTo: [{ label: 'After login, returns to Studio', to: '/studio' }],
        old: {
          image: '/map/auth/login.png',
          route: '/dashboard → /login',
          caption: 'Prod redirects to login',
        },
        new: {
          image: '/map/nuclear/login.png',
          route: '/studio → /login',
          caption: 'Nuclear gate → login',
        },
      },
      {
        id: 'edge-radio-offline',
        title: 'Radio offline badge vs always-on HLS',
        viewName: 'Radio',
        caption:
          'Prod may show offline badge when Icecast is down; Nuclear aims for always-on HLS when feed exists.',
        actions: [
          'See the offline badge (prod) vs the always-on HLS player (Nuclear) for the same stream state',
        ],
        old: {
          image: '/map/listen/radio.png',
          route: '/radio',
          caption: 'Prod radio (offline badge when down)',
        },
        new: {
          image: '/map/nuclear/radio.png',
          route: '/radio',
          caption: 'Nuclear radio + player bar HLS',
        },
      },
      {
        id: 'edge-map-itself',
        title: 'This map page',
        viewName: 'More / map',
        caption:
          'POC-only atlas for comparing Tahti vs Nuclear flows — now also mounted under Admin as its own gated page, alongside the original public /more route. The former "Top bar actions" and "Governance" sections were removed as redundant (governance already has its own page and admin section).',
        parity: 'nuclear-only',
        actions: [
          'Browse the Tahti ↔ Nuclear screenshot atlas',
          'Toggle Tahti vs Nuclear diagram packs',
          'Leave a note on any case',
          'Export notes as CSV',
          'Apply review state (dev only)',
          'Jump to an in-page section (Anonymous / Auth / Listener / Artist / Edge / Flows / Design / Features / Comments)',
        ],
        // No outbound `goesTo` links after removing the Top bar actions and
        // Governance sections (2026-08-31) — this page is now a pure,
        // self-contained atlas with only in-page anchor navigation.
        old: {
          route: '(prod has no /more atlas)',
          caption: 'No prod equivalent',
          absent: true,
        },
        new: {
          image: '/map/nuclear/more.png',
          route: '/more, /admin/map',
          caption: 'Nuclear Tahti map',
        },
      },
    ],
  },
];

/** Flat list for counts / deep links */
export const MAP_CASES: MapCase[] = MAP_CASE_GROUPS.flatMap((g) => g.cases);

/** Legacy single-column groups derived from cases (first image wins). */
export const MAP_SCREEN_GROUPS: MapScreenGroup[] = MAP_CASE_GROUPS.map(
  (group) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    screens: group.cases.map((c) => ({
      id: c.id,
      title: c.title,
      route: c.new.route,
      prodRoute: c.old.route,
      image: c.old.image ?? c.new.image ?? '/map/listen/listen.png',
      blurb: c.caption,
    })),
  }),
);
