import type { Meta, StoryObj } from '@storybook/react-vite';
import { GenrePicker } from '@tahti-web/components/GenrePicker';
import { useState } from 'react';

const meta: Meta<typeof GenrePicker> = {
  title: 'Tahti/Studio/GenrePicker',
  component: GenrePicker,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Wraps the controlled picker with local state so chip toggling / adding a
 * custom genre is interactive in the Storybook canvas. */
function ControlledGenrePicker({ initial }: { initial: string[] }) {
  const [value, setValue] = useState<string[]>(initial);
  return <GenrePicker value={value} onChange={setValue} />;
}

export const Empty: Story = {
  render: () => <ControlledGenrePicker initial={[]} />,
};

export const SomeSelected: Story = {
  render: () => (
    <ControlledGenrePicker initial={['Electronic', 'Ambient', 'Custom Wave']} />
  ),
};

export const AtLimit: Story = {
  render: () => (
    <ControlledGenrePicker
      initial={['Electronic', 'House', 'Techno', 'Trance', 'Ambient']}
    />
  ),
};
