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

test('legacy callbacks land on the matching SPA surface', async ({ page }) => {
  await signIn(page);
  await page.goto('/dashboard?membership=success');
  await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible();

  await page.goto('/dashboard?fanConnect=return');
  await expect(page).toHaveURL(/\/studio\/revenue\?fanConnect=return$/);

  await page.goto('/dashboard/upload/import/soundcloud?sc=connected');
  await expect(page.getByText('SoundCloud connected.')).toBeVisible();
  await expect(page).toHaveURL(/\/sources\/soundcloud$/);
});

test('artist can sign in and reach broadcast and upload tools', async ({
  page,
}) => {
  await signIn(page);

  await page.goto('/studio/go-live');
  await expect(page.getByRole('heading', { name: 'Go Live' })).toBeVisible();

  await page.goto('/studio/upload');
  await expect(page.getByRole('heading', { name: 'Upload' })).toBeVisible();
  await page.getByLabel('Audio file').setInputFiles({
    name: 'cutover-smoke.mp3',
    mimeType: 'audio/mpeg',
    buffer: Buffer.from('cutover-smoke'),
  });
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(
    page.getByText('Upload complete — processing may take a minute.'),
  ).toBeVisible();
});

test('listener can open a fan subscription offer', async ({ page }) => {
  await page.goto('/subscribe/northern-lights');
  await expect(
    page.getByRole('heading', { name: /Subscribe to/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Subscribe' }).first(),
  ).toBeVisible();
});

test('keyboard navigation and review map work in the beta profile', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Alt+Digit2');
  await expect(page).toHaveURL(/\/radio$/);

  await page.goto('/more');
  await expect(page.getByRole('heading', { name: 'Tahti map' })).toBeVisible();
  await expect(
    page.getByText('You can:', { exact: false }).first(),
  ).toBeVisible();
});
