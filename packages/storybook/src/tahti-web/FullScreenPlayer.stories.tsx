import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { FullScreenPlayer } from '@tahti-web/components/FullScreenPlayer';
import { useLayoutStore } from '@tahti-web/stores/layoutStore';
import { usePlayerStore } from '@tahti-web/stores/playerStore';

import type { QueueItem } from '@tahti-player/model';

function mockQueueItem(
  id: string,
  title: string,
  artist: string,
  durationMs?: number,
): QueueItem {
  return {
    id,
    track: {
      title,
      artists: [{ name: artist, roles: ['performer'] }],
      durationMs,
      source: { provider: 'tahti', id },
      artwork: {
        items: [
          { url: `https://picsum.photos/seed/${id}/512`, purpose: 'cover' },
        ],
      },
    },
    status: 'idle',
    addedAtIso: new Date().toISOString(),
  };
}

function withSeededFullScreenPlayer(opts: {
  isLive?: boolean;
  queue?: QueueItem[];
}): Decorator {
  return (Story) => {
    const queue = opts.queue ?? [
      mockQueueItem('archive:1', 'Midnight Drift', 'Northern Lights', 245000),
    ];
    usePlayerStore.setState({
      queue,
      currentId: queue[0]?.id ?? null,
      status: 'playing',
      isLive: opts.isLive ?? false,
      currentTime: 92,
      duration: 245,
      volume: 0.7,
      muted: false,
      shuffle: false,
      repeatMode: 'off',
    });
    useLayoutStore.setState({ fullScreenPlayerOpen: true });
    return <Story />;
  };
}

const meta: Meta<typeof FullScreenPlayer> = {
  title: 'Tahti/Player/FullScreenPlayer',
  component: FullScreenPlayer,
  parameters: { layout: 'fullscreen' },
  decorators: [withSeededFullScreenPlayer({})],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ArchiveTrack: Story = {};

export const LiveChannel: Story = {
  decorators: [
    withSeededFullScreenPlayer({
      isLive: true,
      queue: [
        mockQueueItem(
          'radio:northern-lights',
          'Northern Lights — Live',
          'Northern Lights',
        ),
      ],
    }),
  ],
};
