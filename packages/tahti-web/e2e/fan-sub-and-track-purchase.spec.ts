import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// Journey: an artist uploads one original (riff.wav). A fan who subscribes
// and a fan who buys the track separately should both receive that same
// file at the same quality. The artist should see both as orders, and the
// board audit log should record the essentials.
//
// This spec drives the real UI and compares bytes. It does not invent a
// purchase checkout or rewrite downloads to match the original. Gaps are
// collected and failed as one worklist at the end so Playwright lists
// every inconsistency instead of stopping at the first missing button.

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

function resolveRiffWav(): { filePath: string; fromDownloads: boolean } {
  const found = RIFF_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(
      `riff.wav not found. Looked in: ${RIFF_CANDIDATES.join(', ')}`,
    );
  }
  return {
    filePath: found,
    fromDownloads: found === path.join(os.homedir(), 'Downloads', 'riff.wav'),
  };
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

function identityMismatch(
  label: string,
  actual: WavIdentity,
  expected: WavIdentity,
): string | null {
  if (actual.sha256 === expected.sha256) {
    return null;
  }
  return (
    `${label} is not the uploaded original. ` +
    `got ${actual.byteLength} bytes, ${actual.riff}/${actual.wave}, ` +
    `${actual.sampleRate ?? '?'} Hz, ${actual.bitsPerSample ?? '?'} bit, ` +
    `sha256 ${actual.sha256.slice(0, 12)}… vs original ` +
    `${expected.byteLength} bytes, ${expected.sampleRate} Hz ` +
    `${expected.bitsPerSample}-bit WAV sha256 ${expected.sha256.slice(0, 12)}…`
  );
}

async function signIn(
  page: Page,
  email: string,
  options: { board?: boolean } = {},
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page
    .getByLabel('Password')
    .fill(process.env.TAHTI_E2E_PASSWORD ?? 'demo-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByRole('button', { name: /^Signed in as/ }),
  ).toBeVisible();
  await page.evaluate((shouldSetBoard) => {
    const raw = localStorage.getItem('tahti-web-auth');
    const userId = raw ? JSON.parse(raw)?.state?.user?.id : null;
    if (typeof userId === 'string') {
      localStorage.setItem(`tahti-web-onboarded:${userId}`, '1');
    }
    if (shouldSetBoard && raw) {
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
    }
  }, options.board === true);
  if (options.board) {
    await page.reload();
    await expect(
      page.getByRole('button', { name: /^Signed in as/ }),
    ).toBeVisible();
  }
}

async function artistUsername(page: Page): Promise<string> {
  await page.goto('/studio/branding');
  const href = await page
    .getByRole('link', { name: 'View public profile' })
    .getAttribute('href');
  const match = /\/u\/([^/?#]+)/.exec(href ?? '');
  if (!match?.[1]) {
    throw new Error(`Could not read public profile href from ${href}`);
  }
  return match[1];
}

async function captureDownload(
  page: Page,
): Promise<
  | { buffer: Buffer; filename: string }
  | { missing: true }
  | { navigatedTo: string }
> {
  const downloadButton = page.getByRole('button', { name: /^Download$/ });
  if ((await downloadButton.count()) === 0) {
    return { missing: true };
  }

  const before = page.url();
  const downloadPromise = page
    .waitForEvent('download', { timeout: 8_000 })
    .catch(() => null);
  await downloadButton.first().click();
  const download = await downloadPromise;
  if (download) {
    const filename = download.suggestedFilename() || 'download.bin';
    const dest = path.join(os.tmpdir(), `tahti-e2e-${Date.now()}-${filename}`);
    await download.saveAs(dest);
    return { buffer: fs.readFileSync(dest), filename };
  }

  const after = page.url();
  if (after !== before) {
    return { navigatedTo: after };
  }

  return { missing: true };
}

test('subscriber and separate track purchase both get the original WAV; artist sees both orders; audit log records them', async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(120_000);

  const worklist: string[] = [];
  const note = (issue: string) => {
    worklist.push(issue);
    testInfo.annotations.push({ type: 'issue', description: issue });
  };

  const riff = resolveRiffWav();
  if (!riff.fromDownloads) {
    note(
      `riff.wav is not in Downloads (found at ${riff.filePath}). The requested fixture lives under Music, not ~/Downloads.`,
    );
  }

  const original = fs.readFileSync(riff.filePath);
  const originalId = wavIdentity(original);
  expect(originalId.looksLikeWav).toBe(true);
  expect(originalId.sampleRate).toBe(44100);
  expect(originalId.bitsPerSample).toBe(16);
  expect(originalId.channels).toBe(2);

  await test.step('artist uploads riff.wav and enables public downloads', async () => {
    await signIn(page, 'artist@tahti.live');
    await page.goto('/studio/upload');
    await page.getByLabel('Choose audio file').setInputFiles(riff.filePath);
    await page
      .getByTestId('player-workspace-main')
      .getByRole('button', { name: 'Upload', exact: true })
      .click();
    await expect(page).toHaveURL(/\/studio\/sounds\/[^/]+$/, {
      timeout: 20_000,
    });

    await page.getByLabel('Audience').click();
    await page.getByRole('option', { name: 'Public' }).click();
    const downloads = page.getByLabel('Allow downloads');
    if (!(await downloads.isChecked())) {
      await downloads.check();
    }
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });

  const soundMatch = /\/studio\/sounds\/([^/]+)$/.exec(page.url());
  const soundId = soundMatch?.[1];
  if (!soundId) {
    throw new Error(`Could not extract sound id from ${page.url()}`);
  }
  const username = await artistUsername(page);
  const trackUrl = `/t/${soundId}`;
  note(
    'Studio Upload submit shares the accessible name "Upload" with the global top bar. Playwright must scope the form button to player-workspace-main or the click is a strict-mode violation.',
  );

  let subscriberFile: WavIdentity | null = null;
  let purchaseFile: WavIdentity | null = null;

  await test.step('fan A subscribes and downloads the track', async () => {
    const fanContext = await browser.newContext();
    const fanPage = await fanContext.newPage();
    await signIn(fanPage, 'fan-sub@tahti.live');
    await fanPage.goto(`/subscribe/${username}`);

    const subscribeButton = fanPage
      .getByRole('button', {
        name: 'Subscribe',
      })
      .first();
    await expect(subscribeButton).toBeVisible();
    await subscribeButton.click();

    const mockActivated = fanPage.getByText(/Mock subscribed/i);
    const stripeRedirect = fanPage.getByText(/Redirecting to Stripe Checkout/i);
    const loginFirst = fanPage.getByText(/Log in first/i);
    if (await stripeRedirect.isVisible().catch(() => false)) {
      note(
        'Fan subscribe opens live Stripe Checkout with no test-mode path, so the e2e cannot complete a paid subscription.',
      );
    } else if (await loginFirst.isVisible().catch(() => false)) {
      note('Subscribe refused a signed-in fan and asked them to log in first.');
    } else if (await mockActivated.isVisible().catch(() => false)) {
      note(
        'Mock subscribe activates in-session only — no Stripe charge, no fan-sub payout row, and no FAN_SUBSCRIPTION_CREATE audit event for fan-sub@tahti.live.',
      );
    } else {
      note(
        'Subscribe did not confirm activation in-app and did not start Stripe Checkout.',
      );
    }

    await fanPage.goto(trackUrl);
    if (soundId.startsWith('arch-mock-')) {
      note(
        `Public track page ${trackUrl} cannot serve a mock upload: public detail only reconstructs \${slug}-archive-N ids, so the listener never gets riff.wav.`,
      );
    }

    const buyOnTrack = fanPage.getByRole('button', {
      name: /buy|purchase|pay for this track/i,
    });
    if ((await buyOnTrack.count()) > 0) {
      note(
        'Subscribe page is the fan-sub path, but the track page also shows a purchase control — confirm these are distinct products.',
      );
    }

    const downloaded = await captureDownload(fanPage);
    if ('missing' in downloaded) {
      note(
        'Subscriber download did not produce a file. The track page either has no Download button, or the click did nothing.',
      );
    } else if ('navigatedTo' in downloaded) {
      note(
        `Subscriber Download navigated the tab to ${downloaded.navigatedTo} instead of saving riff.wav. TrackDetailView creates an <a href> without a download attribute, and mock/public download returns a third-party MP3 (SoundHelix), not the uploaded WAV.`,
      );
    } else {
      subscriberFile = wavIdentity(downloaded.buffer);
      const mismatch = identityMismatch(
        'Subscriber download',
        subscriberFile,
        originalId,
      );
      if (mismatch) {
        note(mismatch);
      }
      await testInfo.attach('subscriber-download', {
        body: downloaded.buffer.subarray(0, 64),
        contentType: 'application/octet-stream',
      });
    }

    await fanContext.close();
  });

  await test.step('fan B purchases the track separately and downloads it', async () => {
    const fanContext = await browser.newContext();
    const fanPage = await fanContext.newPage();
    await signIn(fanPage, 'fan-buy@tahti.live');
    await fanPage.goto(trackUrl);

    const purchaseControl = fanPage.getByRole('button', {
      name: /buy this track|purchase track|buy track|pay to download/i,
    });
    const anyPurchase = fanPage.getByRole('button', {
      name: /purchase|buy/i,
    });
    if ((await purchaseControl.count()) === 0) {
      note(
        'No à la carte track-purchase control on the public track page. Paid download in the sibling spec is “a fan-subscriber downloading”, not a separate order. This fan can only hit Download.',
      );
    }

    if (
      (await anyPurchase.count()) > 0 &&
      (await purchaseControl.count()) === 0
    ) {
      note(
        `Track page has a generic Buy/Purchase control (${await anyPurchase.first().innerText()}) that is not a dedicated track purchase.`,
      );
    }

    const downloaded = await captureDownload(fanPage);
    if ('missing' in downloaded) {
      note(
        'Separate-purchase (or non-subscriber) download did not produce a file.',
      );
    } else if ('navigatedTo' in downloaded) {
      note(
        `Separate-purchase Download navigated the tab to ${downloaded.navigatedTo} instead of saving the original WAV.`,
      );
    } else {
      purchaseFile = wavIdentity(downloaded.buffer);
      const mismatch = identityMismatch(
        'Separate-purchase / non-subscriber download',
        purchaseFile,
        originalId,
      );
      if (mismatch) {
        note(mismatch);
      }
      if (
        subscriberFile &&
        purchaseFile &&
        subscriberFile.sha256 !== purchaseFile.sha256
      ) {
        note(
          `Subscriber download and separate-purchase download are different files (sha256 ${subscriberFile.sha256.slice(0, 12)} vs ${purchaseFile.sha256.slice(0, 12)}). They must be the same original at the same quality.`,
        );
      }
      if (purchaseFile.looksLikeWav === false && originalId.looksLikeWav) {
        note(
          'Non-subscriber download is not WAV. Sibling engagement spec serves Opus/MP3 to free listeners and original/FLAC only to fan-subscribers — and the player never requests format=flac — so quality is neither “same as upload” nor split by subscriber as documented.',
        );
      }
    }

    await fanContext.close();
  });

  await test.step('artist sees both orders on the Audience board', async () => {
    await page.goto('/studio/revenue');
    await expect(page.getByRole('heading', { name: 'Audience' })).toBeVisible();

    const orderList = page.getByTestId('fan-order-list');
    await expect(orderList).toBeVisible();

    const thisSessionFanSub = orderList.getByText(/fan-sub@/i);
    const trackOrder = orderList.getByText(
      /track purchase|paid download|riff\.wav|fan-buy@/i,
    );

    if ((await thisSessionFanSub.count()) === 0) {
      note(
        'Studio → Audience payout history does not show the fan-sub@ order from this run. Visible Fan-sub rows (if any) are static mock Supporter/Patron payouts, not appended on subscribe.',
      );
    }
    if ((await trackOrder.count()) === 0) {
      note(
        'Studio → Audience payout history has no separate track-purchase / paid-download order. mergeRevenueOrders() only mixes fan-sub payouts and Revelator royalties — downloads are not orders.',
      );
    }

    const rows = orderList.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount < 2) {
      note(
        `Artist board shows ${rowCount} payout row(s); expected at least the fan-sub order and the track-purchase order from this run.`,
      );
    }
  });

  await test.step('board audit log records subscribe and the track order', async () => {
    await signIn(page, 'artist@tahti.live', { board: true });
    await page.goto('/admin/logs');

    const blocked = page.getByText(/Board access required|Board admin/i);
    const heading = page.getByRole('heading', { name: 'Activity' });
    if (
      await blocked
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      note(
        'Artist cannot open Admin → Logs. The audit log is board-gated, and setting isBoard in localStorage is overwritten by /me on reload unless VITE_MOCK_ADMIN=1. Essential subscribe/purchase info therefore never reaches a log the artist can see.',
      );
      return;
    }
    if (!(await heading.isVisible().catch(() => false))) {
      note('Admin → Logs did not render the Activity audit log.');
      return;
    }

    const search = page.getByPlaceholder('Search logs...');
    if (await search.isVisible().catch(() => false)) {
      await search.fill('subscribed');
    }

    const subEvent = page.getByText(/subscribed/i);
    const downloadEvent = page.getByText(
      /download|track purchase|paid download|riff/i,
    );
    const thisFan = page.getByText(/fan-sub|fan-buy/i);

    if ((await subEvent.count()) === 0) {
      note(
        'Admin → Logs has no fan-subscription audit line from this session. Mock activity is a static DJ Kaski row, not appended on subscribe.',
      );
    }
    if ((await thisFan.count()) === 0) {
      note(
        'Audit log does not mention the fans from this run (fan-sub / fan-buy). Essential actors, amounts, and track id are missing.',
      );
    }
    if ((await downloadEvent.count()) === 0) {
      note(
        'Audit log has no download / track-purchase event. AdminActivityView maps FAN_SUBSCRIPTION_CREATE but not downloads; sibling download rows live in the downloads table, not the board audit feed.',
      );
    }
  });

  await testInfo.attach('worklist.txt', {
    body: worklist.length
      ? worklist.map((issue, index) => `${index + 1}. ${issue}`).join('\n')
      : 'none',
    contentType: 'text/plain',
  });

  expect(
    worklist,
    `Playwright worklist:\n${worklist.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}`,
  ).toEqual([]);
});
