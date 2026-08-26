import { expect, test } from '@playwright/test';

// Covers the real, UI-complete journeys behind the "signup + governance
// voting + stats" request: full registration -> login, governance voting
// mechanics (including the closed-motion history/decision log, which is
// this app's real equivalent of a "voting history" page), and the studio
// stats/listener-map page. Two things from the original ask have NO UI in
// this codebase today and are deliberately not tested here: liking a track
// (toggleFavoriteTrack is 100% localStorage, never reaches the server, so
// there is nothing for an artist to be notified about) and following an
// artist (followArtist/unfollowArtist/fetchFollowing exist in api/client.ts
// but are not called from any view -- no Follow button exists anywhere).

async function signIn(
  page: import('@playwright/test').Page,
  email = 'artist@tahti.live',
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
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

test('a new account can complete registration and immediately log in with it', async ({
  page,
}) => {
  const email = `new-artist-${Date.now()}@example.com`;

  await page.goto('/join');
  await expect(page.getByLabel('Artist name')).toBeVisible();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Username').fill(`newartist${Date.now()}`);
  await page.getByLabel('Artist name').fill('New Test Artist');
  await page.getByLabel('Password', { exact: true }).fill('secure-password');
  await page.getByLabel('Confirm password').fill('secure-password');
  await page.getByRole('button', { name: 'Create account' }).click();

  // Mock registration always succeeds and switches the dialog to login
  // mode -- there's no email-verification step to wait through offline.
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('secure-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('button', { name: /^Signed in as/ }),
  ).toBeVisible();
});

test('registration edge case: an empty artist name keeps the submit button disabled', async ({
  page,
}) => {
  await page.goto('/join');
  await page.getByLabel('Email').fill('edge-case@example.com');
  await page.getByLabel('Username').fill('edgecase');
  await page.getByLabel('Password', { exact: true }).fill('secure-password');
  await page.getByLabel('Confirm password').fill('secure-password');

  await expect(page.getByLabel('Artist name')).toHaveValue('');
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeDisabled();
});

test('governance: a signed-out visitor is prompted to log in, not shown motions', async ({
  page,
}) => {
  await page.goto('/governance');

  await expect(
    page.getByText('Sign in with a cooperative membership account to vote.'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Approve 2026 grant formula' }),
  ).toHaveCount(0);
});

test('governance: closed motions show their final decision as a permanent history/decision log', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/governance');

  const closedMotion = page
    .getByRole('listitem')
    .filter({ hasText: 'Confirm annual report' });
  await expect(closedMotion.getByText('Closed')).toBeVisible();
  await expect(closedMotion.getByText('Your vote:')).toBeVisible();
  await expect(closedMotion.getByText('YES', { exact: true })).toBeVisible();
  await expect(closedMotion.getByText('YES 10')).toBeVisible();
  await expect(closedMotion.getByText('NO 1')).toBeVisible();
  await expect(closedMotion.getByText('ABSTAIN 1')).toBeVisible();
  // A decided motion never shows voting controls again.
  await expect(
    closedMotion.getByRole('button', { name: 'YES', exact: true }),
  ).toHaveCount(0);
});

test('governance: voting on an open motion records the choice and updates the tally live', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/governance');

  const openMotion = page
    .getByRole('listitem')
    .filter({ hasText: 'Approve 2026 grant formula' });
  await expect(openMotion.getByText('Open')).toBeVisible();
  await expect(openMotion.getByText('YES 1')).toBeVisible();
  await expect(openMotion.getByText('Your vote:')).toHaveCount(0);

  await openMotion.getByRole('button', { name: 'YES', exact: true }).click();

  await expect(openMotion.getByText('Your vote:')).toBeVisible();
  await expect(openMotion.getByText('YES 2')).toBeVisible();
  // Edge case: once voted, the motion can't be voted on again -- the
  // choice buttons are gone entirely, not just disabled.
  await expect(
    openMotion.getByRole('button', { name: 'YES', exact: true }),
  ).toHaveCount(0);
  await expect(
    openMotion.getByRole('button', { name: 'NO', exact: true }),
  ).toHaveCount(0);
});

test('artist stats show real listen minutes and the listener geography map', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/studio/stats');

  await expect(page.getByRole('heading', { name: 'Stats' })).toBeVisible();
  await expect(page.getByText('Minutes listened')).toBeVisible();
  await expect(page.getByLabel('Listener world map')).toBeVisible();
  // Edge case worth documenting in the test itself: there is no "likes"
  // metric anywhere on this page -- favoriting a track never leaves the
  // browser (see the file-level comment), so an artist has no way to see
  // like counts here or anywhere else in the product today.
  await expect(page.getByText(/^Likes$/)).toHaveCount(0);
});
