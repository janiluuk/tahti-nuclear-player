// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AudioRevisionList } from './AudioRevisionList';

vi.stubEnv('VITE_FORCE_MOCK', '1');

async function renderList(soundId = 'arch-mock-revisions'): Promise<{
  container: HTMLDivElement;
  root: Root;
}> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <AudioRevisionList
        soundId={soundId}
        trackTitle="Riff"
        artistName="Demo"
      />,
    );
  });
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return { container, root };
}

describe('AudioRevisionList', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_FORCE_MOCK', '1');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('lists the original upload and saves a new audio revision you can compare', async () => {
    const soundId = `arch-mock-revisions-${Date.now()}`;
    const { container, root } = await renderList(soundId);
    expect(container.textContent).toContain('Original upload');
    expect(container.textContent).toContain('Preview');

    const picker = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File([new Uint8Array([82, 73, 70, 70])], 'riff-v2.wav', {
      type: 'audio/wav',
    });
    await act(async () => {
      Object.defineProperty(picker, 'files', {
        configurable: true,
        value: [file],
      });
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const save = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Save as new revision',
    );
    expect(save).toBeTruthy();
    await act(async () => {
      save!.click();
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('riff-v2');
    expect(container.textContent).toContain('Compare');
    expect(container.textContent).toContain('Play A');
    expect(container.textContent).toContain('Play B');
    expect(container.textContent).toContain('Switch A/B');
    expect(container.textContent).toContain('Use this version');

    await act(async () => {
      root.unmount();
    });
  });
});
