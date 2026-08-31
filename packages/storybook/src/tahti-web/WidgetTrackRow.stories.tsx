import type { Meta, StoryObj } from '@storybook/react-vite';
import { WidgetTrackRow } from '@tahti-web/components/discover/WidgetTrackRow';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof WidgetTrackRow> = {
  title: 'Tahti/Discover/WidgetTrackRow',
  component: WidgetTrackRow,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/discover')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Ranked: Story = {
  args: {
    rank: 1,
    item: {
      id: 'archive:track-1',
      title: 'Tundra Static',
      artist: 'Northern Lights',
      channelSlug: 'northern-lights',
      coverUrl: null,
      audioUrl: 'https://example.com/demo.mp3',
      listens: 4213,
      loves: 128,
    },
  },
};

export const Unranked: Story = {
  args: {
    item: {
      id: 'archive:track-2',
      title: 'Aurora Drift',
      artist: 'Kasari',
      channelSlug: 'kasari',
      coverUrl: null,
      audioUrl: 'https://example.com/demo.mp3',
    },
  },
};
