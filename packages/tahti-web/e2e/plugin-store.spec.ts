import { expect, test } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill('artist@tahti.live');
  await page.getByLabel('Password').fill('demo-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.evaluate(() => {
    const raw = localStorage.getItem('tahti-web-auth');
    const userId = raw ? JSON.parse(raw)?.state?.user?.id : null;
    if (typeof userId === 'string') {
      localStorage.setItem(`tahti-web-onboarded:${userId}`, '1');
    }
  });
}

// Verifies the four plugins ported to src/plugins/ this session actually
// work end to end through the real UI, not just their unit tests. See
// PLUGIN-STORE-PLAN.md for what each extraction covers.

test('Studio Pro Editor plugin chain: add, configure, and remove a plugin', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/studio/archive/arch-mock-1/editor');

  await page.getByRole('button', { name: 'Add plugin' }).click();
  const picker = page.getByRole('dialog');
  await expect(picker).toContainText('EQ');
  await expect(picker).toContainText('3-band parametric equalizer');
  await expect(picker).toContainText('Compressor');
  await expect(picker).toContainText('Limiter');
  await expect(picker).toContainText('Filter');

  await picker.getByTestId('card-title').filter({ hasText: 'EQ' }).click();
  await expect(picker).toBeHidden();

  await expect(page.getByRole('slider', { name: /80 Hz gain/ })).toBeVisible();
  await expect(
    page.getByRole('slider', { name: /1200 Hz gain/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('slider', { name: /9000 Hz gain/ }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Remove EQ' }).click();
  await expect(page.getByText('No plugins in the chain yet.')).toBeVisible();
});

test('Studio Go Live multistream: every API-supported provider is selectable, and an unlabeled destination falls back to the provider display name', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/studio/go-live');

  await expect(page.getByText('YouTube')).toBeVisible();

  await page.getByRole('button', { name: 'Add destination' }).click();
  const dialog = page.getByRole('dialog');
  const providerSelect = dialog.getByLabel('Provider');
  const optionLabels = await providerSelect.locator('option').allTextContents();
  expect(optionLabels).toEqual([
    'YouTube',
    'Twitch',
    'Facebook',
    'Kick',
    'TikTok',
    'Mixcloud Live',
    'Instagram',
    'Custom RTMP',
  ]);

  await providerSelect.selectOption('TIKTOK');
  await dialog.getByLabel('Stream key').fill('tiktok-stream-key-1234');
  await dialog.getByRole('button', { name: 'Save destination' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('listitem').filter({ hasText: 'TikTok' }),
  ).toBeVisible();
});

test('Settings > Broadcast > Multistream: provider picker and existing-target labels use the registry too', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/settings/broadcast');
  await page.getByRole('tab', { name: /Multistream/ }).click();

  // The seeded YouTube target's label/author must resolve through the
  // registry, not display the raw wire id -- this panel had its own copy
  // of the same "raw provider" bug StudioGoLiveView/StreamManagerPanel
  // already had fixed.
  await expect(
    page.getByText('YouTube', { exact: true }).first(),
  ).toBeVisible();

  const providerControl = page.getByLabel('Provider');
  await providerControl.click();
  await expect(page.getByRole('option', { name: 'TikTok' })).toBeVisible();
  await expect(
    page.getByRole('option', { name: 'Mixcloud Live' }),
  ).toBeVisible();
  await expect(page.getByRole('option', { name: 'Instagram' })).toBeVisible();
  await page.getByRole('option', { name: 'TikTok' }).click();

  await page.getByLabel('Stream key').fill('tiktok-settings-key-1234');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(
    page.getByTestId('plugin-name').getByText('TikTok'),
  ).toBeVisible();
});

test('Settings connections: export targets render from the relocated plugin registry', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/settings/connections');

  const exportSection = page
    .getByRole('heading', { name: 'Export music' })
    .locator('..');
  await expect(exportSection.getByText('Spotify')).toBeVisible();
  await expect(
    exportSection.getByText('Release delivery through Revelator.').first(),
  ).toBeVisible();
  await expect(exportSection.getByText('Bandcamp')).toBeVisible();
  await expect(exportSection.getByText('hearthis.at')).toBeVisible();
});

test('Radio visualizer renders through the registry with no console errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/radio');
  const canvas = page.locator('[data-visualizer-engine="three"]');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-visualizer-preset', /.+/);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('Studio release fingerprinting: check and re-fingerprint a track through the AcoustID plugin', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/studio/releases/rel-mock-1');
  await page.getByRole('tab', { name: 'Fingerprinting' }).click();

  const blueHourPanel = page
    .locator('div')
    .filter({ has: page.getByText('Blue Hour', { exact: true }) })
    .filter({ has: page.getByRole('button', { name: 'Check for a match' }) })
    .last();
  await expect(blueHourPanel).toBeVisible();

  await blueHourPanel
    .getByRole('button', { name: 'Check for a match' })
    .click();
  await expect(
    blueHourPanel.getByText('No match found. Nothing was changed.'),
  ).toBeVisible();

  await blueHourPanel.getByRole('button', { name: 'Re-fingerprint' }).click();
  await expect(
    blueHourPanel.getByText(/Matches .Similar Sounding Track./),
  ).toBeVisible();
});
