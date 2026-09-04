import type { Meta, StoryObj } from '@storybook/react-vite';

import { TahtiJam } from '@tahti-player/ui';

const meta = {
  title: 'Remote/TahtiJam/Error',
  component: TahtiJam.Error,
  tags: ['autodocs'],
} satisfies Meta<typeof TahtiJam.Error>;

export default meta;
type Story = StoryObj<typeof TahtiJam.Error>;

export const Default: Story = {
  render: () => (
    <TahtiJam>
      <TahtiJam.Error
        labels={{
          title: 'Could not connect to Tahti Player',
          subtitle:
            'Make sure Tahti Player is running and Tahti Jam is enabled in Settings',
        }}
      />
    </TahtiJam>
  ),
};
