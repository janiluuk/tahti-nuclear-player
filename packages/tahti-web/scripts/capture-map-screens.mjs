import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outRoot = join(__dirname, '../public/map/nuclear');
mkdirSync(outRoot, { recursive: true });

const BASE = process.env.MAP_BASE_URL || 'https://beta.tahti.live';
const CHANNEL = process.env.MAP_CHANNEL || 'liis-kask-ee';
// username often equals slug prefix before -ee/-fi
const USER =
  process.env.MAP_USER || CHANNEL.replace(/-(ee|fi|vn|lv|se|no|dk)$/, '');

/** @type {{ id: string; path: string; wait?: number; auth?: boolean }[]} */
const shots = [
  // ── Anonymous / public ──────────────────────────────────────────────────
  { id: 'listen', path: '/', auth: false },
  { id: 'radio', path: '/radio', auth: false },
  { id: 'discover', path: '/discover', auth: false },
  { id: 'channel', path: `/channel/${CHANNEL}`, auth: false },
  { id: 'channel-chat', path: `/chat/${CHANNEL}`, auth: false },
  { id: 'chat-general', path: '/chat', auth: false },
  { id: 'profile', path: `/u/${USER}`, auth: false },
  { id: 'collection', path: `/u/${USER}/c/demo-collection`, auth: false },
  { id: 'smart-link', path: '/r/demo-release', auth: false },
  { id: 'subscribe', path: `/subscribe/${USER}`, auth: false },
  { id: 'artist-subscribe-alias', path: `/u/${USER}/subscribe`, auth: false },
  { id: 'green-room', path: `/u/${USER}/green-room`, auth: false },
  { id: 'embed', path: `/embed/c/${CHANNEL}`, auth: false },
  { id: 'embed-collection', path: '/embed/col/demo-collection', auth: false },
  { id: 'embed-release', path: '/embed/r/demo-release', auth: false },
  {
    id: 'embed-user-channel',
    path: `/embed/u/${USER}/c/${CHANNEL}`,
    auth: false,
  },
  { id: 'login', path: '/login', auth: false },
  { id: 'login-totp', path: '/login', auth: false },
  { id: 'join', path: '/join', auth: false },
  { id: 'apply', path: '/apply', auth: false },
  { id: 'signup', path: '/signup', auth: false },
  { id: 'signup-payment', path: '/signup/payment', auth: false },
  { id: 'forgot-password', path: '/forgot-password', auth: false },
  { id: 'reset-password', path: '/reset-password', auth: false },
  { id: 'setup-password', path: '/setup-password', auth: false },
  { id: 'verify', path: '/verify', auth: false },
  { id: 'onboarding', path: '/onboarding', auth: false },
  { id: 'venues', path: '/venues', auth: false },
  { id: 'venues-register', path: '/venues/register', auth: false },
  { id: 'governance', path: '/governance', auth: false },
  { id: 'governance-feature-requests', path: '/governance/feature-requests' },
  { id: 'about', path: '/about', auth: false },
  { id: 'for-artists', path: '/for-artists', auth: false },
  { id: 'how-it-works', path: '/how-it-works', auth: false },
  { id: 'what-is-it', path: '/what-is-it', auth: false },
  { id: 'whats-new', path: '/whats-new', auth: false },
  { id: 'privacy', path: '/privacy', auth: false },
  { id: 'terms', path: '/terms', auth: false },
  { id: 'agpl', path: '/agpl', auth: false },
  { id: 'help', path: '/help', auth: false },
  { id: 'help-topic', path: '/help/getting-started', auth: false },
  { id: 'status', path: '/status', auth: false },
  { id: 'transparency', path: '/transparency', auth: false },
  { id: 'transparency-methodology', path: '/transparency/methodology' },
  { id: 't-shortlink', path: '/t/demo-release', auth: false },
  { id: 'v-shortlink', path: '/v/demo-release', auth: false },
  { id: 'c-shortlink', path: `/c/${CHANNEL}`, auth: false },

  // ── Listener / member ────────────────────────────────────────────────────
  { id: 'library', path: '/library' },
  { id: 'library-sounds', path: '/library/sounds' },
  { id: 'library-collections', path: '/library/collections' },
  { id: 'library-recordings', path: '/library/recordings' },
  { id: 'library-releases', path: '/library/releases' },
  { id: 'library-smartlinks', path: '/library/smartlinks' },
  { id: 'library-favorites', path: '/library/favorites' },
  { id: 'library-history', path: '/library/history' },
  { id: 'library-upload', path: '/library/upload' },
  { id: 'library-media', path: '/library/media' },
  { id: 'feed', path: '/feed' },
  { id: 'listen-feed-alias', path: '/listen/feed' },
  { id: 'history', path: '/history' },
  { id: 'listen-history-alias', path: '/listen/history' },
  { id: 'favorites', path: '/favorites' },
  { id: 'listener-dashboard', path: '/dashboard' },
  { id: 'account', path: '/account' },
  { id: 'messages', path: '/messages' },
  { id: 'messages-thread', path: '/messages/demo-thread' },
  { id: 'schedule-page', path: '/schedule' },
  { id: 'settings', path: '/settings' },
  { id: 'settings-section', path: '/settings/artist' },
  { id: 'money-tiers', path: '/settings/money' },
  { id: 'money-fan-subs', path: '/settings/money' },
  { id: 'settings-account', path: '/settings/account' },
  { id: 'sources', path: '/sources' },
  { id: 'sources-detail', path: '/sources/soundcloud' },
  { id: 'themes', path: '/themes' },
  { id: 'radio-show', path: `/radio/show/${CHANNEL}` },

  // ── Artist / Studio ──────────────────────────────────────────────────────
  { id: 'studio', path: '/studio' },
  { id: 'go-live', path: '/studio/go-live' },
  { id: 'studio-info', path: '/studio/info' },
  { id: 'archive', path: '/studio/archive' },
  { id: 'archive-item', path: '/studio/archive/arch-mock-1' },
  { id: 'archive-item-editor', path: '/studio/archive/arch-mock-1/editor' },
  { id: 'releases', path: '/studio/releases' },
  { id: 'release-detail', path: '/studio/releases/rel-mock-1' },
  { id: 'collections', path: '/studio/collections' },
  { id: 'collection-edit', path: '/studio/collections/demo-collection' },
  { id: 'editor', path: '/studio/editor' },
  { id: 'editor-track', path: '/studio/editor/arch-mock-1' },
  { id: 'mastering', path: '/studio/mastering/arch-mock-1' },
  { id: 'upload', path: '/studio/upload' },
  { id: 'stash', path: '/studio/stash' },
  { id: 'schedule', path: '/studio/schedule' },
  { id: 'shows', path: '/studio/shows' },
  { id: 'show-detail', path: '/studio/shows/show-mock-1' },
  { id: 'show-episode', path: '/studio/shows/episodes/ep-mock-1' },
  { id: 'stats', path: '/studio/stats' },
  { id: 'stats-detail-alias', path: '/studio/stats/detail' },
  { id: 'stats-detail', path: '/studio/insights/archive/arch-mock-1' },
  { id: 'insights', path: '/studio/insights' },
  { id: 'channel-design', path: '/studio/channel' },
  { id: 'studio-channel-radio', path: '/studio/channel?tab=radio' },
  {
    id: 'studio-channel-multicast',
    path: '/studio/channel?tab=multicast',
  },
  { id: 'studio-governance', path: '/studio/governance' },
  { id: 'studio-events', path: '/studio/events' },
  { id: 'studio-event-new', path: '/studio/events/new' },
  { id: 'studio-branding', path: '/studio/branding' },
  { id: 'studio-venues', path: '/studio/venues' },
  { id: 'studio-playlists', path: '/studio/playlists' },
  { id: 'studio-playlist-detail', path: '/studio/playlists/demo-playlist' },
  { id: 'studio-recordings', path: '/studio/recordings' },
  { id: 'studio-moderation', path: '/studio/moderation' },
  { id: 'setup-channel-gated', path: '/studio/channel?tab=setup' },
  { id: 'studio-setup-channel', path: '/studio/setup-channel' },
  { id: 'updates', path: '/studio/updates' },
  { id: 'revenue', path: '/studio/revenue' },
  { id: 'distribution', path: '/studio/distribution' },

  // ── Admin ────────────────────────────────────────────────────────────────
  { id: 'admin', path: '/admin' },
  { id: 'admin-financial', path: '/admin/financial' },
  { id: 'admin-storage', path: '/admin/storage' },
  { id: 'admin-storage-user', path: '/admin/storage/demo-user-id' },
  { id: 'admin-logs', path: '/admin/logs' },
  { id: 'admin-content', path: '/admin/content' },
  { id: 'admin-moderation', path: '/admin/moderation' },
  { id: 'admin-moderation-tab', path: '/admin/moderation/selects' },
  { id: 'admin-streams', path: '/admin/streams' },
  { id: 'admin-vendors', path: '/admin/vendors' },
  { id: 'admin-venues', path: '/admin/venues' },
  { id: 'admin-disco-widgets', path: '/admin/disco-widgets' },
  { id: 'admin-status', path: '/admin/status' },
  { id: 'admin-users', path: '/admin/users' },
  { id: 'admin-radio', path: '/admin/radio' },
  { id: 'admin-news', path: '/admin/news' },
  { id: 'admin-top-lists', path: '/admin/top-lists' },
  { id: 'admin-announcements', path: '/admin/announcements' },
  { id: 'admin-governance', path: '/admin/governance' },
  { id: 'admin-grants', path: '/admin/grants' },
  { id: 'admin-grants-year', path: '/admin/grants/2026' },
  { id: 'admin-agm', path: '/admin/agm' },
  { id: 'admin-i18n', path: '/admin/i18n' },
  { id: 'admin-map', path: '/admin/map' },
  { id: 'admin-tahti-selects', path: '/admin/tahti-selects' },
  { id: 'admin-activity-orphan', path: '/admin/activity' },
  {
    id: 'admin-radio-station-suggestions-orphan',
    path: '/admin/radio-station-suggestions',
  },
];

const requestedShotIds = new Set(
  (process.env.MAP_SHOT_IDS || '')
    .split(',')
    .map((shotId) => shotId.trim())
    .filter(Boolean),
);
const selectedShots = requestedShotIds.size
  ? shots.filter((shot) => requestedShotIds.has(shot.id))
  : shots;

let browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
let page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
});

// Pitch-quality captures: a named, populated artist (not generic "Demo
// Artist"), and LIVE so the go-live/studio shots show the real on-air
// state instead of an empty connect flow.
const AUTH_STATE = {
  state: {
    user: {
      id: 'mock-1',
      email: 'demo@tahti.live',
      username: USER,
      displayName: 'Mart Saar',
      isBoard: true,
      membershipStatus: 'ACTIVE',
      channel: { slug: CHANNEL, state: 'LIVE' },
    },
  },
  version: 0,
};

/** Right rail (chat/queue) is collapsed on every shot except one, so the
 * chat feature is demonstrated exactly once rather than showing
 * "Chat unavailable" on every single capture. */
const CHAT_DEMO_SHOT_ID = 'channel';

async function setLocalStorage(p, signedIn = true) {
  await p.evaluate(
    ({ auth, rightCollapsed, signedIn: shouldSignIn }) => {
      if (shouldSignIn) {
        localStorage.setItem('tahti-web-auth', JSON.stringify(auth));
      } else {
        localStorage.removeItem('tahti-web-auth');
      }
      // Mark this mock user as already onboarded -- otherwise every
      // authenticated shot gets hijacked by a redirect to /onboarding.
      localStorage.setItem(`tahti-web-onboarded:${auth.state.user.id}`, '1');
      localStorage.setItem(
        'tahti-web-layout',
        JSON.stringify({
          state: {
            leftCollapsed: false,
            rightCollapsed,
            leftWidth: 220,
            rightWidth: 340,
            bottomQueueOpen: false,
          },
          version: 3,
        }),
      );
    },
    { auth: AUTH_STATE, rightCollapsed: true, signedIn },
  );
}

// Prime localStorage from an actual page on BASE before the shot loop
// (can't set localStorage before a document has loaded that origin).
await page
  .goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 })
  .catch(() => {});
await setLocalStorage(page);

async function ensurePage() {
  if (!browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || undefined,
    });
  }
  if (page.isClosed()) {
    page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    await page
      .goto(BASE, { waitUntil: 'domcontentloaded', timeout: 45000 })
      .catch(() => {});
  }
}

for (const s of selectedShots) {
  await ensurePage();
  const url = `${BASE}${s.path}`;
  const out = join(outRoot, `${s.id}.png`);
  try {
    await setLocalStorage(page, s.auth !== false);
    // Re-apply layout state per shot (some pages reset chatSlug/rightCollapsed
    // on mount) -- keep chat open only for the one demo shot.
    await page.evaluate(
      (rightCollapsed) => {
        const raw = localStorage.getItem('tahti-web-layout');
        const parsed = raw ? JSON.parse(raw) : { state: {}, version: 3 };
        parsed.state.rightCollapsed = rightCollapsed;
        localStorage.setItem('tahti-web-layout', JSON.stringify(parsed));
      },
      s.id === CHAT_DEMO_SHOT_ID ? false : true,
    );
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    if (s.id === 'login-totp') {
      await page.getByLabel('Email').fill('demo+totp@tahti.live');
      await page.getByLabel('Password').fill('totp-demo');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByLabel('Authentication code').waitFor();
    }
    if (s.id === 'money-fan-subs') {
      await page.getByRole('tab', { name: 'Fan subs' }).click();
      await page
        .getByRole('region', { name: 'Fan subscription summary' })
        .waitFor();
    }
    if (s.id === 'settings-account') {
      await page.getByRole('tab', { name: 'Notifications' }).click();
      await page.getByRole('heading', { name: /notifications/i }).waitFor();
    }
    await page.waitForTimeout(s.wait ?? 900);
    // Hide cookie/noise if any; capture main viewport
    await page.screenshot({ path: out, fullPage: false });
    console.log('ok', s.id, s.path);
  } catch (err) {
    console.error('fail', s.id, err.message);
    await ensurePage();
    try {
      await setLocalStorage(page, s.auth !== false);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: out, fullPage: false });
      console.log('ok-soft', s.id);
    } catch (e2) {
      console.error('skip', s.id, e2.message);
    }
  }
  await page.close().catch(() => {});
}

await browser.close();
console.log('done', outRoot);
