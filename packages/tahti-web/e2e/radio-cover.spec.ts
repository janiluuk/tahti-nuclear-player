import { expect, test, type Page } from '@playwright/test';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function signIn(
  page: Page,
  { board = false }: { board?: boolean } = {},
): Promise<void> {
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 20_000 });
  await page.getByLabel('Email').fill('artist@tahti.live');
  await page.getByLabel('Password').fill('demo-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('button', { name: /^Signed in as/ }),
  ).toBeVisible();
  await page.evaluate(() => {
    const raw = localStorage.getItem('tahti-web-auth');
    const userId = raw ? JSON.parse(raw)?.state?.user?.id : null;
    if (typeof userId === 'string') {
      localStorage.setItem(`tahti-web-onboarded:${userId}`, '1');
    }
  });
  if (board) {
    await page.addInitScript(() => {
      const raw = localStorage.getItem('tahti-web-auth');
      if (!raw) {
        return;
      }
      const auth = JSON.parse(raw) as {
        state?: {
          user?: { role?: string; roles?: string[]; isBoard?: boolean };
        };
      };
      const user = auth.state?.user;
      if (user) {
        user.role = 'BOARD';
        user.roles = ['BOARD', 'ARTIST'];
        user.isBoard = true;
        localStorage.setItem('tahti-web-auth', JSON.stringify(auth));
      }
    });
  }
  await page.reload();
  await expect(
    page.getByRole('button', { name: /^Signed in as/ }),
  ).toBeVisible();
}

async function openRadioAddons(page: Page): Promise<void> {
  await page.goto('/settings/plugin-store');
  const settings = page.getByRole('dialog');
  await expect(
    settings.getByRole('heading', { name: 'Add-ons' }),
  ).toBeVisible();
  await settings.getByRole('tab', { name: 'Radio' }).click();
  await expect(
    settings.getByText('Curated internet radio stations'),
  ).toBeVisible();
  await settings.getByRole('tab', { name: /^Available/ }).click();
}

test('admin can replace a radio cover and see it persist', async ({ page }) => {
  await signIn(page, { board: true });
  await openRadioAddons(page);

  const settings = page.getByRole('dialog');
  const availableHelsinki = settings.getByTestId('plugin-item').filter({
    hasText: 'Radio Helsinki',
  });
  await expect(availableHelsinki).toBeVisible();
  await availableHelsinki
    .getByRole('button', { name: 'Enable Radio Helsinki' })
    .click();
  await settings.getByRole('tab', { name: /^Installed/ }).click();
  const helsinki = settings.getByTestId('plugin-item').filter({
    hasText: 'Radio Helsinki',
  });
  await expect(helsinki).toBeVisible();

  const edit = helsinki.getByRole('button', {
    name: 'Edit Radio Helsinki cover',
  });
  await expect(edit).toBeAttached();
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    edit.click({ force: true }),
  ]);
  await chooser.setFiles({
    name: 'radio-cover.png',
    mimeType: 'image/png',
    buffer: PNG_1X1,
  });

  await expect
    .poll(async () =>
      helsinki
        .getByTestId('radio-station-cover-image')
        .locator('img')
        .getAttribute('src'),
    )
    .toMatch(/^data:image\/png/);

  await settings.getByTestId('dialog-x-close').click();
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Radio channels' }),
  ).toBeVisible();
  const listenCover = page
    .getByTestId('card')
    .filter({ hasText: 'Radio Helsinki' })
    .locator('img')
    .first();
  await expect(listenCover).toHaveAttribute('src', /^data:image\/png/);

  await page.goto('/admin/radio');
  await expect(page.getByText('Internet radio')).toBeVisible();
  const adminRow = page.locator('li').filter({ hasText: 'Radio Helsinki' });
  await expect(
    adminRow.getByTestId('radio-station-cover-image').locator('img'),
  ).toHaveAttribute('src', /^data:image\/png/);
  await adminRow.getByRole('button', { name: 'Enable for everyone' }).click();

  await page.goto('/');
  const feedCard = page
    .getByRole('heading', { name: 'Radio', exact: true })
    .locator('..')
    .getByTestId('card')
    .filter({ hasText: 'Radio Helsinki' });
  await expect(feedCard.locator('img').first()).toHaveAttribute(
    'src',
    /^data:image\/png/,
  );
});

test('non-admins do not see the radio cover edit control', async ({ page }) => {
  await signIn(page);
  await openRadioAddons(page);
  const settings = page.getByRole('dialog');
  const helsinki = settings.getByTestId('plugin-item').filter({
    hasText: 'Radio Helsinki',
  });
  await expect(helsinki).toBeVisible();
  await expect(
    helsinki.getByRole('button', { name: 'Edit Radio Helsinki cover' }),
  ).toHaveCount(0);
});
