import { TEST_CHANGELOG } from '../../test/fixtures/changelog';
import { WhatsNewWrapper } from './WhatsNew.test-wrapper';

vi.mock('../../../changelog.json', () => ({
  default: TEST_CHANGELOG,
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue([]),
}));

vi.mock('@tauri-apps/api/app', () => ({
  getVersion: vi.fn().mockResolvedValue('1.0.0'),
}));

vi.mock('@tauri-apps/plugin-log', () => ({
  attachLogger: vi.fn().mockResolvedValue(() => {}),
  warn: () => Promise.resolve(),
  debug: () => Promise.resolve(),
  trace: () => Promise.resolve(),
  info: () => Promise.resolve(),
  error: () => Promise.resolve(),
}));

describe("What's New view", () => {
  it('renders the view title', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.title).toHaveTextContent("What's New");
  });

  it('displays changelog entries with descriptions', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(1).description).toHaveTextContent(
      'Improved plugin loading performance',
    );
  });

  it('combines same-week entries into a single row', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(0).description).toHaveTextContent(
      'Support importing legacy format playlists',
    );
    expect(WhatsNewWrapper.entry(0).description).toHaveTextContent(
      'Fixed audio stuttering on track transition',
    );
  });

  it('formats dates as human-readable strings', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(0).date).toHaveTextContent('Mar 1, 2026');
  });

  it('shows type badges on each entry, preferring the most notable type in a merged week', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(0).typeBadge).toHaveTextContent('Feature');
    expect(WhatsNewWrapper.entry(1).typeBadge).toHaveTextContent('Improvement');
    expect(WhatsNewWrapper.entry(2).typeBadge).toHaveTextContent('Feature');
  });

  it('shows a single contributor with @ prefix', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(0).contributors).toHaveLength(1);
    expect(WhatsNewWrapper.entry(0).contributors[0]).toHaveTextContent(
      '@nukeop',
    );
  });

  it('shows multiple contributors', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(1).contributors).toHaveLength(2);
    expect(WhatsNewWrapper.entry(1).contributors[0]).toHaveTextContent(
      '@someDev',
    );
    expect(WhatsNewWrapper.entry(1).contributors[1]).toHaveTextContent(
      '@nukeop',
    );
  });

  it('does not render contributors when not provided', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(2).contributors).toHaveLength(0);
  });

  it('shows tags when present', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(0).tags).toHaveLength(1);
    expect(WhatsNewWrapper.entry(0).tags[0]).toHaveTextContent('Playlists');
  });

  it('does not render tags when not provided', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.entry(1).tags).toHaveLength(0);
  });

  it('shows see more button when there are more entries', async () => {
    await WhatsNewWrapper.mount();
    expect(WhatsNewWrapper.seeMoreButton.element).toHaveTextContent(
      'See more (1 older)',
    );
  });

  it('reveals all entries when see more is clicked', async () => {
    await WhatsNewWrapper.mount();
    await WhatsNewWrapper.seeMoreButton.click();

    expect(WhatsNewWrapper.entries).toHaveLength(4);
    expect(WhatsNewWrapper.entry(3).description).toHaveTextContent(
      'Reduced startup time by lazy-loading plugins',
    );
  });
});
