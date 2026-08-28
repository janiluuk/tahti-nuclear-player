import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { chromium } from '@playwright/test';

const BASE = process.env.README_GUIDE_BASE_URL || 'http://127.0.0.1:5190';
const outputDirectory = join(process.cwd(), 'docs/readme-shots');
mkdirSync(outputDirectory, { recursive: true });

const auth = {
  state: {
    user: {
      id: 'mock-board-1',
      email: 'board@tahti.live',
      username: 'board',
      displayName: 'Board Member',
      isBoard: true,
      membershipStatus: 'ACTIVE',
      channel: { slug: 'demo', state: 'OFFLINE' },
    },
  },
  version: 0,
};

const layout = {
  state: {
    leftCollapsed: false,
    rightCollapsed: true,
    bottomQueueOpen: false,
    leftWidth: 220,
    rightWidth: 340,
    chatSlug: null,
    chatEnabled: false,
    chatDisabledReason: null,
    chatAutoOpenedFor: null,
  },
  version: 3,
};

const routes = [
  [
    '/',
    'listen-home',
    'Listener home',
    'Browse stations, releases and the active player.',
  ],
  [
    '/radio',
    'listen-radio',
    'Radio directory',
    'Find live channels and open a station.',
  ],
  [
    '/discover',
    'listen-discover',
    'Discover',
    'Explore tracks, artists and collections.',
  ],
  [
    '/feed',
    'listen-feed',
    'Your feed',
    'Follow updates and play shared tracks.',
  ],
  [
    '/library',
    'library-all-sounds',
    'Library / All sounds',
    'Manage uploaded audio with search, filters and playback.',
  ],
  [
    '/library/collections',
    'library-collections',
    'Library / Collections',
    'Organize albums, EPs, playlists and podcasts.',
  ],
  [
    '/library/recordings',
    'library-recordings',
    'Library / Recordings',
    'Review recordings from broadcasts and shows.',
  ],
  [
    '/library/history',
    'library-history',
    'Library / History',
    'Return to recently played items and listening history.',
  ],
  [
    '/library/favorites',
    'library-favorites',
    'Library / Favourites',
    'Keep loved tracks available from the main library.',
  ],
  [
    '/library/smartlinks',
    'library-smartlinks',
    'Library / Smartlinks',
    'Create and monitor shareable release links.',
  ],
  [
    '/messages',
    'listener-messages',
    'Messages',
    'Open conversations and highlighted message threads.',
  ],
  [
    '/settings/account',
    'settings-account',
    'Settings / Account',
    'Manage identity, security, privacy and notifications.',
  ],
  [
    '/settings/artist',
    'settings-artist',
    'Settings / Artist',
    'Edit artist identity, branding, gallery and connections.',
  ],
  [
    '/settings/channel',
    'settings-channel',
    'Settings / Channel',
    'Configure channel details and public discovery.',
  ],
  [
    '/settings/broadcast',
    'settings-broadcast',
    'Settings / Broadcast',
    'Configure radio, green room and multicast destinations.',
  ],
  [
    '/settings/audience',
    'settings-audience',
    'Settings / Audience',
    'Manage tiers, subscriptions and grants.',
  ],
  [
    '/settings/themes',
    'settings-themes',
    'Settings / Themes',
    'Choose the visual language and appearance.',
  ],
  [
    '/settings/plugin-store',
    'settings-addons',
    'Settings / Add-ons',
    'Configure player, import, export and channel extensions.',
  ],
  [
    '/settings/whats-new',
    'settings-whats-new',
    'Settings / What’s new',
    'Read product changes and release notes.',
  ],
  [
    '/channel/demo',
    'public-channel-aurora',
    'Public channel / Aurora',
    'A public artist channel with the Aurora visualizer.',
  ],
  [
    '/radio/show/northern-lights',
    'public-radio-grid',
    'Public radio channel / Reactive Grid',
    'Listen to a live channel with a different visualizer preset.',
  ],
  [
    '/u/demo',
    'public-artist',
    'Artist profile',
    'See the artist identity, story, people and public catalogue.',
  ],
  [
    '/governance',
    'governance',
    'Governance',
    'Review proposals, voting and community decisions.',
  ],
  [
    '/help',
    'help-center',
    'Help center',
    'Find guidance for listening, publishing and broadcasting.',
  ],
  [
    '/status',
    'platform-status',
    'Platform status',
    'Check service health and operational status.',
  ],
  [
    '/studio',
    'studio-overview',
    'Studio / Overview',
    'See channel health, upcoming shows and work that needs attention.',
  ],
  [
    '/studio/stats',
    'studio-stats-overview',
    'Studio / Stats / Overview',
    'Review audience and catalogue performance at a glance.',
  ],
  [
    '/studio/stats?tab=plays',
    'studio-stats-plays',
    'Studio / Stats / Plays & listeners',
    'Compare plays, listeners and activity over time.',
  ],
  [
    '/studio/stats?tab=top-lists',
    'studio-stats-top-lists',
    'Studio / Stats / Top lists',
    'Inspect top tracks, countries and content types.',
  ],
  [
    '/studio/updates',
    'studio-posts',
    'Studio / Posts',
    'Publish updates and manage newsletter communication.',
  ],
  [
    '/studio/distribution',
    'studio-distribution',
    'Studio / Distribution',
    'Prepare catalogue delivery to external services.',
  ],
  [
    '/studio/insights',
    'studio-insights',
    'Studio / Insights',
    'Review track and catalogue insights.',
  ],
  [
    '/studio/revenue',
    'studio-audience',
    'Studio / Audience',
    'Manage audience relationships and fan revenue.',
  ],
  [
    '/studio/archive',
    'studio-sounds',
    'Studio / Library / Sounds',
    'Filter, sort, play and edit sound content.',
  ],
  [
    '/studio/archive?tab=clips',
    'studio-clips',
    'Studio / Library / Clips',
    'Manage short clips and radio announcements.',
  ],
  [
    '/studio/collections',
    'studio-collections',
    'Studio / Library / Collections',
    'Create and browse organized collections.',
  ],
  [
    '/studio/releases',
    'studio-releases',
    'Studio / Library / Releases',
    'Manage singles, EPs and albums.',
  ],
  [
    '/studio/recordings',
    'studio-recordings',
    'Studio / Library / Recordings',
    'Polish and publish broadcast recordings.',
  ],
  [
    '/studio/upload',
    'studio-upload',
    'Studio / Library / Upload',
    'Add tracks, releases, clips and imports.',
  ],
  [
    '/studio/editor',
    'studio-editor',
    'Studio / Library / Editor',
    'Open an audio session or import from the library.',
  ],
  [
    '/studio/stash',
    'studio-stash',
    'Studio / Library / Stash',
    'Keep private content out of the public catalogue.',
  ],
  [
    '/studio/go-live',
    'studio-go-live',
    'Studio / Perform / Go live',
    'Run pre-flight, rotation and live broadcast controls.',
  ],
  [
    '/studio/schedule',
    'studio-schedule',
    'Studio / Perform / Schedule',
    'Plan broadcasts and inspect analytics.',
  ],
  [
    '/studio/events',
    'studio-events',
    'Studio / Perform / Events',
    'Manage upcoming and past events.',
  ],
  [
    '/studio/events/new',
    'studio-event-new',
    'Studio / Perform / New event',
    'Create an event with venue, ticket and artwork details.',
  ],
  [
    '/studio/venues',
    'studio-venues',
    'Studio / Perform / Venues',
    'Browse and manage venue directory entries.',
  ],
  [
    '/studio/shows',
    'studio-shows',
    'Studio / Perform / Shows',
    'Manage single shows and continuing series.',
  ],
  [
    '/studio/shows/show-series-demo',
    'studio-show-detail',
    'Studio / Perform / Show detail',
    'Review show metadata, episodes and recordings.',
  ],
  [
    '/studio/channel',
    'studio-channel',
    'Studio / Manage / Channel',
    'Edit channel information and channel wizard access.',
  ],
  [
    '/studio/channel?tab=radio',
    'studio-radio',
    'Studio / Manage / Radio',
    'Control stream statistics and 24/7 rotation.',
  ],
  [
    '/studio/channel?tab=green-room',
    'studio-green-room',
    'Studio / Manage / Green room',
    'Configure the broadcast preparation space.',
  ],
  [
    '/studio/channel?tab=multicast',
    'studio-multicast',
    'Studio / Manage / Multicast',
    'Activate configured stream destinations.',
  ],
  [
    '/studio/channel?tab=selects',
    'studio-selects',
    'Studio / Manage / Tahti Selects',
    'Curate the community rotation.',
  ],
  [
    '/studio/moderation',
    'studio-moderation',
    'Studio / Manage / Moderation',
    'Assign moderators and review channel queues.',
  ],
  [
    '/admin',
    'admin-overview',
    'Admin / Overview',
    'Monitor platform needs action, streams and system status.',
  ],
  [
    '/admin/status',
    'admin-status',
    'Admin / Status',
    'View platform health alongside operational data.',
  ],
  [
    '/admin/logs',
    'admin-logs',
    'Admin / Logs / Activity',
    'Inspect operational activity.',
  ],
  [
    '/admin/logs?tab=containers',
    'admin-logs-containers',
    'Admin / Logs / Containers',
    'Inspect container and service logs.',
  ],
  [
    '/admin/logs?tab=recent-audit',
    'admin-logs-audit',
    'Admin / Logs / Recent audit',
    'Review recent privileged actions and context.',
  ],
  [
    '/admin/moderation',
    'admin-moderation',
    'Admin / Moderation / Support',
    'Triage moderation queues.',
  ],
  [
    '/admin/moderation/beta',
    'admin-moderation-beta',
    'Admin / Moderation / Beta applications',
    'Review beta applications.',
  ],
  [
    '/admin/moderation/radio-submissions',
    'admin-moderation-radio',
    'Admin / Moderation / Radio submissions',
    'Review Tahti Radio submissions.',
  ],
  [
    '/admin/moderation/content-reports',
    'admin-moderation-reports',
    'Admin / Moderation / Content reports',
    'Resolve content reports.',
  ],
  [
    '/admin/moderation/feature-requests',
    'admin-moderation-features',
    'Admin / Moderation / Feature requests',
    'Track product requests.',
  ],
  [
    '/admin/moderation/missed-shows',
    'admin-moderation-missed',
    'Admin / Moderation / Missed shows',
    'Resolve missed broadcast follow-up.',
  ],
  [
    '/admin/users',
    'admin-users',
    'Admin / Users',
    'Manage accounts and roles.',
  ],
  [
    '/admin/radio',
    'admin-radio',
    'Admin / Radio',
    'Manage station configuration.',
  ],
  [
    '/admin/news',
    'admin-news',
    'Admin / Posts',
    'Publish generic announcements.',
  ],
  [
    '/admin/streams',
    'admin-streams',
    'Admin / Streams',
    'Manage streams, listeners and controls.',
  ],
  [
    '/admin/top-lists',
    'admin-top-lists',
    'Admin / Top lists',
    'Explore platform listening rankings.',
  ],
  [
    '/admin/announcements',
    'admin-announcements',
    'Admin / Announcements',
    'Manage pinned and public announcements.',
  ],
  [
    '/admin/storage',
    'admin-storage',
    'Admin / Storage',
    'Review storage usage.',
  ],
  [
    '/admin/storage?tab=files',
    'admin-storage-files',
    'Admin / Storage / Files',
    'Inspect stored files.',
  ],
  [
    '/admin/financial',
    'admin-financial',
    'Admin / Financial',
    'Review platform financial summaries.',
  ],
  [
    '/admin/governance',
    'admin-governance',
    'Admin / Governance',
    'Review proposals, votes and discussion activity.',
  ],
  [
    '/admin/grants',
    'admin-grants',
    'Admin / Grants',
    'Manage grant cycles and awards.',
  ],
  [
    '/admin/agm',
    'admin-agm',
    'Admin / AGM',
    'Prepare and review annual meeting decisions.',
  ],
  [
    '/admin/vendors',
    'admin-vendors',
    'Admin / Vendors',
    'Manage platform vendors and integrations.',
  ],
  [
    '/admin/disco-widgets',
    'admin-widgets',
    'Admin / Widgets',
    'Catalog and configure discovery widgets.',
  ],
  [
    '/admin/i18n',
    'admin-i18n',
    'Admin / Localization',
    'Manage translated product content.',
  ],
  [
    '/admin/tahti-selects',
    'admin-selects',
    'Admin / Tahti Selects',
    'Curate the platform-wide selection.',
  ],
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
await page.evaluate(
  ({ authState, layoutState }) => {
    localStorage.setItem('tahti-web-auth', JSON.stringify(authState));
    localStorage.setItem('tahti-web-layout', JSON.stringify(layoutState));
    localStorage.setItem('tahti-web-onboarded:mock-board-1', '1');
  },
  { authState: auth, layoutState: layout },
);

const results = [];
for (const [path, file, title, narration] of routes) {
  const errors = [];
  const onConsole = (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  };
  page.on('console', onConsole);
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const bodyText = await page.locator('body').innerText();
  const imagePath = join(outputDirectory, `${file}.png`);
  await page.screenshot({ path: imagePath, fullPage: true });
  results.push({
    path,
    file: `${file}.png`,
    title,
    narration,
    hasContent: bodyText.trim().length > 40,
    errors: errors.slice(0, 3),
  });
  page.off('console', onConsole);
  console.log(`${file}: ${bodyText.trim().length} chars`);
}

writeFileSync(
  join(outputDirectory, 'manifest.json'),
  `${JSON.stringify(results, null, 2)}\n`,
);
await browser.close();
const failed = results.filter((result) => !result.hasContent);
if (failed.length > 0) {
  console.error(
    `Screenshots with unexpectedly little content: ${failed.map((result) => result.file).join(', ')}`,
  );
  process.exitCode = 1;
}
