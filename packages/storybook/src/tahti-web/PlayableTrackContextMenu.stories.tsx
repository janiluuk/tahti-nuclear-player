import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlayableTrackContextMenu } from '@tahti-web/components/PlayableTrackContextMenu';
import { MoreHorizontalIcon } from 'lucide-react';

import type { Track } from '@tahti-player/model';
import { Button } from '@tahti-player/ui';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof PlayableTrackContextMenu> = {
  title: 'Tahti/Track/PlayableTrackContextMenu',
  component: PlayableTrackContextMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/library')],
};

export default meta;
type Story = StoryObj<typeof meta>;

// The trigger is a real Radix dropdown — click it in the canvas to open the
// menu (matches the house TrackContextMenu.stories.tsx convention).
const trigger = (
  <Button size="icon" aria-label="Track options">
    <MoreHorizontalIcon size={18} />
  </Button>
);

const archiveTrack: Track = {
  title: 'Aurora',
  artists: [{ name: 'Northern Lights', roles: ['performer'] }],
  durationMs: 214_000,
  artwork: {
    items: [
      { url: 'https://picsum.photos/seed/aurora/128/128', purpose: 'cover' },
    ],
  },
  source: { provider: 'tahti', id: 'archive:archive-item-1' },
};

// A live/radio signal has no archive item to save to a playlist, so the
// "Add to playlist" action is omitted for it.
const liveTrack: Track = {
  title: 'Live at Tahti Radio',
  artists: [{ name: 'DJ Frost', roles: ['performer'] }],
  source: { provider: 'tahti', id: 'live:tahti-radio' },
};

export const ArchiveTrack: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Playlist actions use TrackContextMenu.Submenu (Storybook With Submenu). Archive tracks also get an Audio tools submenu when signed in.',
      },
    },
  },
  args: { track: archiveTrack, children: trigger },
};

export const LiveTrackNoPlaylistAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Live/radio rows omit Add to playlist and Audio tools (no archive sound id).',
      },
    },
  },
  args: { track: liveTrack, children: trigger },
};
