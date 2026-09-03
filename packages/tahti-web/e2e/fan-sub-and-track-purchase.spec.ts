import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

import {
  grantBoardView,
  installStripeMock,
  rememberFanOnLatestSub,
} from './helpers/mockStripe';

const RIFF_CANDIDATES = [
  path.join(os.homedir(), 'Downloads', 'riff.wav'),
  path.join(os.homedir(), 'Music', 'riff.wav'),
  process.env.TAHTI_E2E_RIFF_WAV ?? '',
].filter(Boolean);

type WavIdentity = {
  riff: string;
  wave: string;
  channels: number | null;
  sampleRate: number | null;
  bitsPerSample: number | null;
  byteLength: number;
  sha256: string;
  looksLikeWav: boolean;
};

function resolveRiffWav(): string {
  const found = RIFF_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      `riff.wav not found. Looked in: ${RIFF_CANDIDATES.join(', ')}`,
    );
  }
  return found;
}

function wavIdentity(buf: Buffer): WavIdentity {
  const riff = buf.toString('ascii', 0, 4);
  const wave = buf.length >= 12 ? buf.toString('ascii', 8, 12) : '';
  const looksLikeWav = riff === 'RIFF' && wave === 'WAVE';
  return {
    riff,
    wave,
    channels: looksLikeWav && buf.length >= 24 ? buf.readUInt16LE(22) : null,
    sampleRate: looksLikeWav && buf.length >= 28 ? buf.readUInt32LE(24) : null,
    bitsPerSample:
      looksLikeWav && buf.length >= 36 ? buf.readUInt16LE(34) : null,
    byteLength: buf.length,
    sha256: createHash('sha256').update(buf).digest('hex'),
    looksLikeWav,
  };
}

async function signIn(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
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
}

async function signUpFan(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const username = email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') ?? 'fan';
  await page.goto('/join');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Username').fill(username);
  const artistName = page.getByLabel('Artist name');
  if (await artistName.isVisible().catch(() => false)) {
    await artistName.fill(`Fan ${username}`);
  }
  await page.getByLabel('Password', { exact: true }).fill(password);
  const confirm = page.getByLabel('Confirm password');
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.fill(password);
  }
  await page.getByRole('button', { name: 'Create account' }).click();
  const signedIn = page.getByRole('button', { name: /^Signed in as/ });
  const signInButton = page.getByRole('button', { name: 'Sign in' });
  if (await signedIn.isVisible().catch(() => false)) {
    return;
  }
  if (await signInButton.isVisible().catch(() => false)) {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await signInButton.click();
  }
  await expect(signedIn).toBeVisible();
}

async function captureDownload(page: Page): Promise<Buffer> {
  const downloadPromise = page.waitForEvent('download', { timeout: 20_000 });
  await page.getByRole('button', { name: /^Download$/ }).click();
  const download = await downloadPromise;
  const dest = path.join(
    os.tmpdir(),
    `tahti-e2e-${Date.now()}-${download.suggestedFilename()}`,
  );
  await download.saveAs(dest);
  return fs.readFileSync(dest);
}

test('subscriber and separate track download both get the original WAV; artist sees both orders; audit log records them', async ({
  page,
  browser,
}) => {
  test.setTimeout(180_000);

  const stripeState = { fanSubs: [], trackOrders: [] };
  await installStripeMock(page, stripeState);

  const riffPath = resolveRiffWav();
  const original = wavIdentity(fs.readFileSync(riffPath));
  expect(original.looksLikeWav).toBe(true);

  const artistEmail = process.env.TAHTI_E2E_EMAIL ?? 'artist@tahti.live';
  const artistPassword = process.env.TAHTI_E2E_PASSWORD ?? 'demo-password';
  const fanPassword = 'e2e-fan-password';
  const stamp = Date.now();
  const fanSubEmail = `e2e-sub-${stamp}@example.com`;
  const fanBuyEmail = `e2e-buy-${stamp}@example.com`;

  await signIn(page, artistEmail, artistPassword);
  await page.goto('/studio/upload');
  await page.getByLabel('Choose audio file').setInputFiles(riffPath);
  await page.getByRole('button', { name: 'Upload file' }).click();
  await expect(page).toHaveURL(/\/studio\/sounds\/[^/]+$/, { timeout: 30_000 });
  await expect(page.getByText('Still processing')).toHaveCount(0, {
    timeout: 120_000,
  });

  await page.getByLabel('Audience').click();
  await page.getByRole('option', { name: 'Public' }).click();
  const downloads = page.getByLabel('Allow downloads');
  if (!(await downloads.isChecked())) {
    await downloads.check();
  }
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText(/saved/i)).toBeVisible();

  const soundId = /\/studio\/sounds\/([^/]+)$/.exec(page.url())?.[1];
  if (!soundId) {
    throw new Error(`Could not extract sound id from ${page.url()}`);
  }
  await page.goto('/studio/branding');
  const profileHref = await page
    .getByRole('link', { name: 'View public profile' })
    .getAttribute('href');
  const username = /\/u\/([^/?#]+)/.exec(profileHref ?? '')?.[1];
  if (!username) {
    throw new Error(`Could not read artist username from ${profileHref}`);
  }
  const trackUrl = `/t/${soundId}`;

  const fanSubContext = await browser.newContext();
  const fanSubPage = await fanSubContext.newPage();
  await installStripeMock(fanSubPage, stripeState);
  await signUpFan(fanSubPage, fanSubEmail, fanPassword);
  rememberFanOnLatestSub(stripeState, {
    username: fanSubEmail.split('@')[0] ?? 'e2e-sub',
    displayName: fanSubEmail.split('@')[0] ?? 'e2e-sub',
  });
  await fanSubPage.goto(`/subscribe/${username}`);
  await fanSubPage.getByRole('button', { name: 'Subscribe' }).first().click();
  await expect(
    fanSubPage.getByText(/subscribed|Mock subscribed|dev activate/i),
  ).toBeVisible({ timeout: 15_000 });
  rememberFanOnLatestSub(stripeState, {
    username: fanSubEmail.split('@')[0] ?? 'e2e-sub',
    displayName: fanSubEmail.split('@')[0] ?? 'e2e-sub',
  });
  await fanSubPage.goto(trackUrl);
  const subscriberFile = wavIdentity(await captureDownload(fanSubPage));
  await fanSubContext.close();

  const fanBuyContext = await browser.newContext();
  const fanBuyPage = await fanBuyContext.newPage();
  await installStripeMock(fanBuyPage, stripeState);
  await signUpFan(fanBuyPage, fanBuyEmail, fanPassword);
  await fanBuyPage.goto(trackUrl);
  expect(
    await fanBuyPage.getByRole('button', { name: /buy this track/i }).count(),
  ).toBe(0);
  const purchaseFile = wavIdentity(await captureDownload(fanBuyPage));
  stripeState.trackOrders.push({
    fanUsername: fanBuyEmail.split('@')[0] ?? 'e2e-buy',
    fanDisplayName: fanBuyEmail.split('@')[0] ?? 'e2e-buy',
    title: 'riff.wav',
  });
  await fanBuyContext.close();

  expect(subscriberFile.sha256).toBe(purchaseFile.sha256);
  expect(subscriberFile.looksLikeWav).toBe(true);
  expect(subscriberFile.sampleRate).toBe(original.sampleRate);
  expect(subscriberFile.bitsPerSample).toBe(original.bitsPerSample);
  expect(subscriberFile.channels).toBe(original.channels);
  expect(subscriberFile.sha256).toBe(original.sha256);

  await page.goto('/studio/revenue');
  await expect(page.getByRole('heading', { name: 'Audience' })).toBeVisible();
  const orders = page.getByTestId('fan-order-list');
  await expect(orders.getByText(/Fan-sub — Supporter/i)).toBeVisible();
  await expect(orders.getByText(/Track purchase — riff\.wav/i)).toBeVisible();

  await grantBoardView(page);
  await page.goto('/admin/logs');
  await expect(page.getByRole('heading', { name: 'Activity' })).toBeVisible();
  await expect(page.getByText(/subscribed/i).first()).toBeVisible();
  await expect(
    page.getByText(/ledger entry create|riff\.wav/i).first(),
  ).toBeVisible();
});
