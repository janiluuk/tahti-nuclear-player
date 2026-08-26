import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { BottomQueueStrip } from '@tahti-web/components/BottomQueueStrip';
import { usePlayerStore } from '@tahti-web/stores/playerStore';

import type { QueueItem } from '@nuclearplayer/model';
import { PlayerBar } from '@nuclearplayer/ui';

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
          { url: `https://picsum.photos/seed/${id}/128`, purpose: 'cover' },
        ],
      },
    },
    status: 'idle',
    addedAtIso: new Date().toISOString(),
  };
}

const mockQueue: QueueItem[] = [
  mockQueueItem('archive:1', 'Midnight Drift', 'Northern Lights', 245000),
  mockQueueItem('archive:2', 'Static Bloom', 'Halcyon Field', 198000),
  mockQueueItem('archive:3', 'Low Tide', 'Northern Lights', 312000),
  mockQueueItem('archive:4', 'Glass Hours', 'Halcyon Field', 221000),
];

function withSeededQueue(
  queue: QueueItem[],
  currentId: string | null,
): Decorator {
  return (Story) => {
    usePlayerStore.setState({ queue, currentId });
    return <Story />;
  };
}

const sampleControls = (
  <PlayerBar.Controls
    isPlaying
    labels={{
      shuffleOn: 'Shuffle on',
      shuffleOff: 'Shuffle off',
      repeatOff: 'Repeat off',
      repeatAll: 'Repeat all',
      repeatOne: 'Repeat one',
    }}
    onPlayPause={() => {}}
    onNext={() => {}}
    onPrevious={() => {}}
    onShuffleToggle={() => {}}
    onRepeatToggle={() => {}}
    showDiscovery={false}
  />
);

const meta: Meta<typeof BottomQueueStrip> = {
  title: 'Tahti/Player/BottomQueueStrip',
  component: BottomQueueStrip,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withSeededQueue(mockQueue, mockQueue[1]!.id)],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { controls: sampleControls },
};

export const EmptyQueue: Story = {
  decorators: [withSeededQueue([], null)],
  args: { controls: sampleControls },
};
