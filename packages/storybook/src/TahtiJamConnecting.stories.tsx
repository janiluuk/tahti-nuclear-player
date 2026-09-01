import type { Meta, StoryObj } from '@storybook/react-vite';

import { TahtiJam } from '@tahti-player/ui';

const meta = {
  title: 'Remote/TahtiJam/Connecting',
  component: TahtiJam.Connecting,
  tags: ['autodocs'],
} satisfies Meta<typeof TahtiJam.Connecting>;

export default meta;
type Story = StoryObj<typeof TahtiJam.Connecting>;

export const Default: Story = {
  render: () => (
    <TahtiJam>
      <TahtiJam.Connecting
        labels={{
          title: 'Connecting to Nuclear...',
          subtitle: 'Make sure Nuclear is running and Nuclear Jam is enabled',
        }}
      />
    </TahtiJam>
  ),
};
