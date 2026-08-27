import { mkdirSync } from 'fs';
import { join } from 'path';
import { chromium } from '@playwright/test';

const BASE = process.env.STUDIO_AUDIT_BASE_URL || 'http://127.0.0.1:5192';
const outDir = join(process.cwd(), 'docs/redesign-shots/studio-audit');
mkdirSync(outDir, { recursive: true });

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
  ['/studio', 'studio'],
  ['/studio/stats', 'studio-stats'],
  ['/studio/updates', 'studio-updates'],
  ['/studio/distribution', 'studio-distribution'],
  ['/studio/insights', 'studio-insights'],
  ['/studio/revenue', 'studio-fanbase'],
  ['/library', 'library'],
  ['/studio/archive', 'library-archive'],
  ['/studio/releases', 'library-releases'],
  ['/studio/collections', 'library-collections'],
  ['/studio/playlists', 'library-playlists'],
  ['/studio/recordings', 'library-recordings'],
  ['/studio/upload', 'library-upload'],
  ['/studio/editor', 'library-editor'],
  ['/studio/stash', 'library-stash'],
  ['/library/favorites', 'library-favorites'],
  ['/library/history', 'library-history'],
  ['/studio/go-live', 'perform-go-live'],
  ['/studio/schedule', 'perform-schedule'],
  ['/studio/events', 'perform-events'],
  ['/studio/events/new', 'perform-events-new'],
  ['/studio/venues', 'perform-venues'],
  ['/studio/shows', 'perform-shows'],
  ['/studio/shows/show-series-demo', 'perform-show-detail'],
  ['/studio/channel', 'manage-channel'],
  ['/studio/branding', 'manage-branding'],
  ['/studio/moderation', 'manage-moderation'],
  ['/studio/setup-channel', 'manage-setup'],
  ['/studio/channel?tab=radio', 'manage-channel-radio'],
  ['/studio/channel?tab=profile', 'manage-channel-profile'],
  ['/studio/channel?tab=domain', 'manage-channel-domain'],
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE}/`);
await page.evaluate(
  ({ authState, layoutState }) => {
    localStorage.setItem('tahti-web-auth', JSON.stringify(authState));
    localStorage.setItem('tahti-web-layout', JSON.stringify(layoutState));
    localStorage.setItem('tahti-web-onboarded:mock-board-1', '1');
  },
  { authState: auth, layoutState: layout },
);

const warnings = [];
for (const [path, name] of routes) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  const result = await page.evaluate(() => {
    const topHeader = document.querySelector('header');
    const tabs = document.querySelector('[data-studio-section-tabs]');
    const menu = document.querySelector('[data-studio-section-menu]');
    const isVisible = (element) => {
      const box = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return (
        box.width > 0 &&
        box.height > 0 &&
        styles.display !== 'none' &&
        styles.visibility !== 'hidden' &&
        Number(styles.opacity) > 0.5
      );
    };
    const activeTabs = tabs
      ? [...tabs.querySelectorAll('[aria-selected="true"]')].filter(isVisible)
          .length
      : 0;
    const activeMenu = menu
      ? [...menu.querySelectorAll('[aria-current="page"]')].filter(isVisible)
          .length
      : 0;
    const rect = (element) => {
      if (!element) {
        return null;
      }
      const box = element.getBoundingClientRect();
      return [box.x, box.y, box.width, box.height];
    };
    const contentHeading = document.querySelector('h1');
    return {
      topHeader: Boolean(topHeader),
      tabs: Boolean(tabs),
      menu: Boolean(menu),
      activeTabs,
      activeMenu,
      tabsRect: rect(tabs),
      menuRect: rect(menu),
      headingRect: rect(contentHeading),
      bodyText: document.body.innerText.slice(0, 100),
    };
  });
  if (!result.topHeader || !result.tabs || !result.menu) {
    warnings.push(`${name}: missing top header, section tabs, or submenu`);
  }
  if (result.activeTabs !== 1) {
    warnings.push(
      `${name}: expected 1 active top tab, found ${result.activeTabs}`,
    );
  }
  if (result.activeMenu !== 1) {
    warnings.push(
      `${name}: expected 1 active submenu item, found ${result.activeMenu}`,
    );
  }
  if (
    result.tabsRect &&
    result.headingRect &&
    result.headingRect[1] - (result.tabsRect[1] + result.tabsRect[3]) > 32
  ) {
    warnings.push(`${name}: excessive gap before content heading`);
  }
  const before = JSON.stringify(result.menuRect);
  await page.waitForTimeout(350);
  const after = await page
    .locator('[data-studio-section-menu]')
    .evaluate((element) => {
      const box = element.getBoundingClientRect();
      return [box.x, box.y, box.width, box.height];
    });
  if (before !== JSON.stringify(after)) {
    warnings.push(`${name}: submenu moved after settling`);
  }
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
  console.log(`captured ${name}`);
}

await browser.close();
console.log(
  `studio audit complete: ${routes.length} views, warnings=${warnings.length}`,
);
for (const warning of warnings) {
  console.log(`WARN ${warning}`);
}
if (warnings.length > 0) {
  process.exitCode = 1;
}
