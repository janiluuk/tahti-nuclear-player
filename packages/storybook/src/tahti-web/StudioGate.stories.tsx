import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AuthUser } from '@tahti-web/api/types';
import { StudioGate } from '@tahti-web/components/StudioGate';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const ARTIST_NO_CHANNEL: AuthUser = {
  ...MOCK_USERS.artist,
  channel: null,
};

const meta: Meta<typeof StudioGate> = {
  title: 'Tahti/Studio/StudioGate',
  component: StudioGate,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
  args: {
    children: <p>You should not see this — gated content.</p>,
  },
};

export const NoChannelYet: Story = {
  decorators: [withMockAuth(ARTIST_NO_CHANNEL)],
  args: {
    children: <p>You should not see this — gated content.</p>,
  },
};

export const ArtistWithChannel: Story = {
  decorators: [withMockAuth(MOCK_USERS.artist)],
  args: {
    children: (
      <p className="rounded-md border border-dashed p-4 text-sm">
        Channel access granted — studio content renders here.
      </p>
    ),
  },
};

/** `requireChannel={false}` — e.g. the channel-setup page itself, which an
 * artist without a channel yet still needs to reach. */
export const ChannelNotRequired: Story = {
  decorators: [withMockAuth(ARTIST_NO_CHANNEL)],
  args: {
    requireChannel: false,
    children: (
      <p className="rounded-md border border-dashed p-4 text-sm">
        Signed-in artist, no channel required for this page.
      </p>
    ),
  },
};
