/**
 * Capture Nuclear UI screenshots for the prod→Nuclear screen atlas.
 * Expect Vite with VITE_FORCE_MOCK=1 on REDESIGN_BASE_URL (default :5190).
 */
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../docs/redesign-shots');
mkdirSync(outDir, { recursive: true });

const BASE = process.env.REDESIGN_BASE_URL || 'http://127.0.0.1:5190';

/** Board admin with a channel so studio + /more (board-only) both render. */
const authState = {
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

/** Keep the right chat/queue rail collapsed in every capture. */
const layoutStateClosedChat = {
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

/** @type {{ path: string, out: string, auth?: boolean }[]} */
const shots = [
  // Public / listen
  { path: '/', out: 'listen-home-v1.png', auth: false },
  { path: '/radio', out: 'listen-radio-v1.png', auth: false },
  { path: '/feed', out: 'listen-feed-v1.png', auth: false },
  { path: '/discover', out: 'listen-discover-v1.png', auth: false },
  { path: '/channel/demo', out: 'listen-channel-v1.png', auth: false },
  { path: '/u/demo', out: 'listen-artist-v1.png', auth: true },
  { path: '/r/demo', out: 'listen-smartlink-v1.png', auth: false },
  { path: '/subscribe/demo', out: 'subscribe-v1.png', auth: false },
  { path: '/venues', out: 'venues-v1.png', auth: false },
  { path: '/venues/register', out: 'venues-register-v1.png', auth: false },
  { path: '/embed/c/demo', out: 'embed-channel-v1.png', auth: false },
  { path: '/login', out: 'auth-login-v1.png', auth: false },
  { path: '/join', out: 'auth-join-v1.png', auth: false },
  { path: '/help', out: 'help-v1.png', auth: false },
  { path: '/status', out: 'status-v1.png', auth: false },
  { path: '/transparency', out: 'transparency-v1.png', auth: false },
  { path: '/governance', out: 'governance-v1.png', auth: false },
  { path: '/about', out: 'legal-about-v1.png', auth: false },
  // Listener
  { path: '/library', out: 'listener-library-v1.png', auth: true },
  {
    path: '/library/releases',
    out: 'listener-library-releases-v1.png',
    auth: true,
  },
  {
    path: '/library/collections',
    out: 'listener-library-collections-v1.png',
    auth: true,
  },
  {
    path: '/library/recordings',
    out: 'listener-library-recordings-v1.png',
    auth: true,
  },
  {
    path: '/library/favorites',
    out: 'listener-library-favorites-v1.png',
    auth: true,
  },
  {
    path: '/library/history',
    out: 'listener-library-history-v1.png',
    auth: true,
  },
  { path: '/messages', out: 'listener-messages-v1.png', auth: true },
  { path: '/settings', out: 'settings-v1.png', auth: true },
  { path: '/sources', out: 'sources-v1.png', auth: true },
  // Studio
  { path: '/studio', out: 'studio-home-v1.png', auth: true },
  { path: '/studio/go-live', out: 'studio-go-live-v1.png', auth: true },
  { path: '/studio/archive', out: 'studio-archive-v1.png', auth: true },
  { path: '/studio/recordings', out: 'studio-recordings-v1.png', auth: true },
  {
    path: '/studio/archive/arch-mock-1',
    out: 'studio-archive-item-v1.png',
    auth: true,
  },
  { path: '/studio/upload', out: 'studio-upload-v1.png', auth: true },
  { path: '/studio/releases', out: 'studio-releases-v1.png', auth: true },
  {
    path: '/studio/releases/rel-mock-1',
    out: 'studio-release-detail-v1.png',
    auth: true,
  },
  { path: '/studio/collections', out: 'studio-collections-v1.png', auth: true },
  { path: '/studio/editor', out: 'studio-editor-v1.png', auth: true },
  { path: '/studio/schedule', out: 'studio-schedule-v1.png', auth: true },
  { path: '/studio/stats', out: 'studio-stats-v1.png', auth: true },
  {
    path: '/studio/stats/detail',
    out: 'studio-stats-detail-v1.png',
    auth: true,
  },
  { path: '/studio/channel', out: 'studio-channel-v1.png', auth: true },
  { path: '/studio/branding', out: 'studio-branding-v1.png', auth: true },
  {
    path: '/studio/setup-channel',
    out: 'studio-setup-channel-v1.png',
    auth: true,
  },
  { path: '/studio/shows', out: 'studio-shows-v1.png', auth: true },
  { path: '/studio/events', out: 'studio-events-v1.png', auth: true },
  { path: '/studio/playlists', out: 'studio-playlists-v1.png', auth: true },
  { path: '/studio/updates', out: 'studio-updates-v1.png', auth: true },
  { path: '/studio/revenue', out: 'studio-revenue-v1.png', auth: true },
  {
    path: '/studio/distribution',
    out: 'studio-distribution-v1.png',
    auth: true,
  },
  { path: '/studio/stash', out: 'studio-stash-v1.png', auth: true },
  { path: '/studio/moderation', out: 'studio-moderation-v1.png', auth: true },
  { path: '/studio/venues', out: 'studio-venues-v1.png', auth: true },
  { path: '/studio/events', out: 'studio-events-v1.png', auth: true },
  {
    path: '/studio/insights/track/rel-mock-1',
    out: 'studio-insights-v1.png',
    auth: true,
  },
  // Board admin
  { path: '/admin', out: 'admin-dashboard-current-v1.png', auth: true },
  { path: '/admin/activity', out: 'admin-activity-current-v1.png', auth: true },
  { path: '/admin/logs', out: 'admin-logs-current-v1.png', auth: true },
  { path: '/admin/users', out: 'admin-users-current-v1.png', auth: true },
  { path: '/admin/radio', out: 'admin-radio-current-v1.png', auth: true },
  {
    path: '/admin/radio-submissions',
    out: 'admin-radio-submissions-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/radio-station-suggestions',
    out: 'admin-radio-station-suggestions-current-v1.png',
    auth: true,
  },
  { path: '/admin/news', out: 'admin-news-current-v1.png', auth: true },
  {
    path: '/admin/tahti-selects',
    out: 'admin-selects-current-v1.png',
    auth: true,
  },
  { path: '/admin/streams', out: 'admin-streams-current-v1.png', auth: true },
  { path: '/admin/support', out: 'admin-support-current-v1.png', auth: true },
  {
    path: '/admin/top-lists',
    out: 'admin-top-lists-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/announcements',
    out: 'admin-announcements-current-v1.png',
    auth: true,
  },
  { path: '/admin/storage', out: 'admin-storage-current-v1.png', auth: true },
  { path: '/admin/files', out: 'admin-files-current-v1.png', auth: true },
  {
    path: '/admin/content-reports',
    out: 'admin-content-reports-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/financial',
    out: 'admin-financial-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/governance',
    out: 'admin-governance-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/feature-requests',
    out: 'admin-feature-requests-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation',
    out: 'admin-moderation-current-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation/support',
    out: 'admin-moderation-support-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation/beta',
    out: 'admin-moderation-beta-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation/radio-submissions',
    out: 'admin-moderation-radio-submissions-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation/selects',
    out: 'admin-moderation-selects-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation/content-reports',
    out: 'admin-moderation-content-reports-v1.png',
    auth: true,
  },
  {
    path: '/admin/moderation/feature-requests',
    out: 'admin-moderation-feature-requests-v1.png',
    auth: true,
  },
  { path: '/admin/grants', out: 'admin-grants-current-v1.png', auth: true },
  { path: '/admin/agm', out: 'admin-agm-current-v1.png', auth: true },
  { path: '/admin/vendors', out: 'admin-vendors-current-v1.png', auth: true },
  { path: '/admin/status', out: 'admin-status-current-v1.png', auth: true },
  { path: '/admin/i18n', out: 'admin-i18n-current-v1.png', auth: true },
  { path: '/more', out: 'map-more-v1.png', auth: true },
  // Current navigation audit: every visible Studio and Admin submenu.
  { path: '/library/history', out: 'audit-listener-history.png', auth: true },
  {
    path: '/library/favorites',
    out: 'audit-listener-favorites.png',
    auth: true,
  },
  { path: '/library/releases', out: 'audit-library-releases.png', auth: true },
  {
    path: '/library/collections',
    out: 'audit-library-collections.png',
    auth: true,
  },
  {
    path: '/library/recordings',
    out: 'audit-library-recordings.png',
    auth: true,
  },
  {
    path: '/library/smartlinks',
    out: 'audit-library-smartlinks.png',
    auth: true,
  },
  {
    path: '/studio/recordings',
    out: 'audit-studio-recordings.png',
    auth: true,
  },
  { path: '/studio/editor', out: 'audit-studio-editor.png', auth: true },
  { path: '/studio/events', out: 'audit-studio-events.png', auth: true },
  { path: '/studio/venues', out: 'audit-studio-venues.png', auth: true },
  { path: '/studio/shows', out: 'audit-studio-shows.png', auth: true },
  {
    path: '/studio/distribution',
    out: 'audit-studio-distribution.png',
    auth: true,
  },
  {
    path: '/studio/moderation',
    out: 'audit-studio-moderation.png',
    auth: true,
  },
  {
    path: '/studio/channel?tab=radio',
    out: 'audit-studio-channel-radio.png',
    auth: true,
  },
  {
    path: '/studio/channel?tab=green-room',
    out: 'audit-studio-channel-green-room.png',
    auth: true,
  },
  {
    path: '/studio/channel?tab=multicast',
    out: 'audit-studio-channel-multicast.png',
    auth: true,
  },
  {
    path: '/studio/channel?tab=selects',
    out: 'audit-studio-channel-selects.png',
    auth: true,
  },
  {
    path: '/admin/moderation/support',
    out: 'audit-admin-moderation-support.png',
    auth: true,
  },
  {
    path: '/admin/moderation/beta',
    out: 'audit-admin-moderation-beta.png',
    auth: true,
  },
  {
    path: '/admin/moderation/radio-submissions',
    out: 'audit-admin-moderation-radio.png',
    auth: true,
  },
  {
    path: '/admin/moderation/selects',
    out: 'audit-admin-moderation-selects.png',
    auth: true,
  },
  {
    path: '/admin/moderation/content-reports',
    out: 'audit-admin-moderation-reports.png',
    auth: true,
  },
  {
    path: '/admin/moderation/feature-requests',
    out: 'audit-admin-moderation-features.png',
    auth: true,
  },
  {
    path: '/admin/missed-shows',
    out: 'audit-admin-missed-shows.png',
    auth: true,
  },
  { path: '/admin/files', out: 'audit-admin-files.png', auth: true },
  { path: '/admin/tahti-selects', out: 'audit-admin-selects.png', auth: true },
];

const selectedShots = process.env.ATLAS_SHOT
  ? shots.filter((shot) => shot.out.includes(process.env.ATLAS_SHOT))
  : shots;

const launchOpts = {
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.env.CHROMIUM_NO_SANDBOX ? ['--no-sandbox'] : [],
};

let browser = await chromium.launch(launchOpts);
let page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let lastAuth = null;

/** Some pages (e.g. hCaptcha widgets) can crash the renderer in a
 * network-sandboxed environment — relaunch and re-apply auth if that happens. */
async function ensureAlive() {
  if (browser.isConnected() && !page.isClosed()) {
    return;
  }
  browser = await chromium.launch(launchOpts);
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  lastAuth = null;
}

async function setAuth(on) {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  if (on) {
    await page.evaluate(
      ({ auth, layout }) => {
        localStorage.setItem('tahti-web-auth', JSON.stringify(auth));
        localStorage.setItem('tahti-web-onboarded:mock-board-1', '1');
        localStorage.setItem('tahti-web-layout', JSON.stringify(layout));
      },
      { auth: authState, layout: layoutStateClosedChat },
    );
  } else {
    await page.evaluate((layout) => {
      localStorage.removeItem('tahti-web-auth');
      localStorage.setItem('tahti-web-layout', JSON.stringify(layout));
    }, layoutStateClosedChat);
  }
}

/** Collapse the right chat rail if a page (e.g. Channel) re-opened it. */
async function ensureChatClosed() {
  await page.evaluate((layout) => {
    localStorage.setItem('tahti-web-layout', JSON.stringify(layout));
  }, layoutStateClosedChat);
  const collapse = page.getByRole('button', { name: 'Collapse panel' });
  const count = await collapse.count();
  // Left + right sidebars both use this label; collapse the rightmost open one.
  for (let i = count - 1; i >= 0; i -= 1) {
    const btn = collapse.nth(i);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      break;
    }
  }
}

async function navigationGeometry() {
  return page
    .locator(
      '[data-studio-section-tabs], [data-studio-section-menu], [data-admin-section-tabs], [data-admin-section-menu]',
    )
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      }),
    );
}

async function validateNavigationState() {
  const sectionTabs = page
    .locator('[data-studio-section-tabs], [data-admin-section-tabs]')
    .last();
  const sectionTabCount = await sectionTabs.count();
  if (sectionTabCount > 0) {
    const activeSectionCount = await sectionTabs
      .locator('[aria-selected="true"]:visible')
      .evaluateAll(
        (elements) =>
          elements.filter(
            (element) => Number(getComputedStyle(element).opacity) > 0.5,
          ).length,
      );
    if (activeSectionCount !== 1) {
      return `expected one active section tab, found ${activeSectionCount}`;
    }
  }

  const sectionMenus = page
    .locator('[data-studio-section-menu], [data-admin-section-menu]')
    .last();
  const sectionMenuCount = await sectionMenus.count();
  if (sectionMenuCount > 0) {
    const activeMenuCount = await sectionMenus
      .locator('[aria-current="page"]:visible')
      .evaluateAll(
        (elements) =>
          elements.filter(
            (element) => Number(getComputedStyle(element).opacity) > 0.5,
          ).length,
      );
    if (activeMenuCount > 1) {
      return `expected at most one active menu item, found ${activeMenuCount}`;
    }
  }

  return null;
}

let failed = 0;

for (const s of selectedShots) {
  await ensureAlive();
  const wantAuth = s.auth !== false;
  if (lastAuth !== wantAuth) {
    await setAuth(wantAuth);
    lastAuth = wantAuth;
  }
  try {
    await page.goto(`${BASE}${s.path}`, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
  } catch {
    await ensureAlive();
    try {
      await page.goto(`${BASE}${s.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
    } catch (err) {
      console.error('skip', s.out, err.message);
      failed += 1;
      continue;
    }
  }
  try {
    if (s.out === 'map-more-v1.png') {
      // Seed one note so the CSV export button renders in its enabled state.
      await page.evaluate(() => {
        localStorage.setItem(
          'tahti-web-map-notes',
          JSON.stringify({
            state: {
              notesByCaseId: {
                'anon-home': 'Genre chips need higher contrast on dark theme.',
              },
            },
            version: 0,
          }),
        );
      });
      await page.reload({ waitUntil: 'networkidle' });
    }
    await ensureChatClosed();
    await page.waitForTimeout(1800);
    await ensureChatClosed();
    const initialNavigationGeometry = await navigationGeometry();
    await page.waitForTimeout(300);
    const finalNavigationGeometry = await navigationGeometry();
    if (
      JSON.stringify(initialNavigationGeometry) !==
      JSON.stringify(finalNavigationGeometry)
    ) {
      console.warn('WARN navigation shifted', s.out);
      failed += 1;
    }
    const navigationError = await validateNavigationState();
    if (navigationError) {
      console.warn(`WARN navigation state: ${s.out} — ${navigationError}`);
      failed += 1;
    }
    const out = join(outDir, s.out);
    await page.screenshot({ path: out, fullPage: true });
    let text = (
      await page
        .locator('body')
        .innerText()
        .catch(() => '')
    ).slice(0, 200);
    if (!text || text.length < 8) {
      // Flaky renders happen in this sandboxed headless env — one retry with a reload.
      await page
        .reload({ waitUntil: 'networkidle', timeout: 30000 })
        .catch(() => {});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: out, fullPage: true });
      text = (
        await page
          .locator('body')
          .innerText()
          .catch(() => '')
      ).slice(0, 200);
    }
    console.log('wrote', s.out, '|', text.replace(/\s+/g, ' ').slice(0, 80));
    if (!text || text.length < 8) {
      console.warn('WARN empty-ish', s.out);
      failed += 1;
    }
  } catch (err) {
    console.error('skip', s.out, err.message);
    failed += 1;
  }
}

await browser.close();
console.log(`done ${selectedShots.length} shots, warnings=${failed}`);
if (failed > selectedShots.length / 2) {
  process.exitCode = 1;
}
