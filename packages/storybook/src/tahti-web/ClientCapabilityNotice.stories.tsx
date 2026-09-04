import type { Meta, StoryObj } from '@storybook/react-vite';
import { ClientCapabilityNotice } from '@tahti-web/components/ClientCapabilityNotice';

import { Button } from '@tahti-player/ui';

const meta: Meta<typeof ClientCapabilityNotice> = {
  title: 'Tahti/Widgets/ClientCapabilityNotice',
  component: ClientCapabilityNotice,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NotInClient: Story = {
  args: {
    kind: 'not-in-client',
    title: 'Desktop-only feature',
    children: 'This capability only exists in the Tahti Player desktop app.',
  },
};

export const ComingSoon: Story = {
  args: {
    kind: 'coming-soon',
    title: 'Collaborative playlists',
    children: 'Real-time co-editing is planned but not built yet.',
  },
};

export const Partial: Story = {
  args: {
    kind: 'partial',
    title: 'Lyrics',
    children: 'Synced lyrics work for most tracks, but not every source.',
  },
};

export const LinkOut: Story = {
  args: {
    kind: 'link-out',
    title: 'Full profile editor',
    children: 'The complete editor lives on tahti.live.',
    action: (
      <Button size="sm" variant="secondary">
        Open tahti.live
      </Button>
    ),
  },
};

export const MockOnly: Story = {
  args: {
    kind: 'mock-only',
    title: 'Payout history',
    children: 'This preview uses sample data — no real payouts are shown.',
  },
};

export const NoTitle: Story = {
  args: {
    kind: 'not-in-client',
    children: 'A notice with no title, just body copy.',
  },
};
