import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { AudioEngine } from '@tahti-web/components/AudioEngine';
import { usePlayerStore } from '@tahti-web/stores/playerStore';

/**
 * AudioEngine is a non-visual side-effect component: it mounts a hidden
 * `<audio>` element and wires it to the player store (HLS via hls.js,
 * Web Audio analyser graph, MediaSession OS controls). There is nothing
 * to look at — this story exists to document its presence in the tree
 * and to prove it mounts/unmounts cleanly against a seeded store without
 * throwing. The "player" below is provided as page furniture so the
 * story isn't a blank canvas.
 */
function withSeededPlayer(): Decorator {
  return (Story) => {
    usePlayerStore.setState({
      queue: [
        {
          id: 'radio:northern-lights',
          track: {
            title: 'Northern Lights — Live',
            artists: [{ name: 'Northern Lights', roles: ['performer'] }],
            source: { provider: 'tahti', id: 'radio:northern-lights' },
            streamCandidates: [
              {
                id: 'radio:northern-lights:stream',
                title: 'Northern Lights — Live',
                failed: false,
                source: { provider: 'tahti', id: 'radio:northern-lights' },
                stream: {
                  url: 'https://stream.tahti.live/northern-lights/live.m3u8',
                  protocol: 'hls',
                  source: { provider: 'tahti', id: 'radio:northern-lights' },
                },
                lastResolvedAtIso: new Date().toISOString(),
              },
            ],
          },
          status: 'idle',
          addedAtIso: new Date().toISOString(),
        },
      ],
      currentId: 'radio:northern-lights',
      status: 'paused',
      isLive: true,
    });
    return <Story />;
  };
}

const meta: Meta<typeof AudioEngine> = {
  title: 'Tahti/Player/AudioEngine',
  component: AudioEngine,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withSeededPlayer()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  render: () => (
    <div className="text-foreground-secondary text-sm">
      <p>
        AudioEngine renders no visible UI — it mounts a hidden{' '}
        <code>&lt;audio&gt;</code> element and drives playback from{' '}
        <code>usePlayerStore</code>. This story seeds the store with a live
        radio playable so the effect chain (HLS attach, MediaSession, analyser
        graph) runs the same code path it would in the real app.
      </p>
      <div className="border-border bg-background-secondary/40 mt-3 rounded-lg border border-dashed p-6 text-center">
        (hidden &lt;audio&gt; element mounted below — nothing to render)
      </div>
      <AudioEngine />
    </div>
  ),
};
