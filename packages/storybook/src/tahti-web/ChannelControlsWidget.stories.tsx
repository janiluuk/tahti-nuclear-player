import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelControlsWidget } from '@tahti-web/components/ChannelControlsWidget';

const meta = {
  title: 'Tahti/Artist/ChannelControlsWidget',
  component: ChannelControlsWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof ChannelControlsWidget>;

export default meta;
type Story = StoryObj<typeof ChannelControlsWidget>;

export const CollapsibleSections: Story = {
  args: {
    sections: [
      {
        id: 'appearance',
        title: 'Appearance',
        description: 'Choose the visual language for your public channel.',
        children: (
          <p className="text-foreground-secondary text-sm">
            Visualizer presets, accent colours, and header treatments belong
            here.
          </p>
        ),
      },
      {
        id: 'identity',
        title: 'Identity',
        description: 'Keep your public artist information up to date.',
        defaultOpen: false,
        children: (
          <p className="text-foreground-secondary text-sm">
            Profile and channel identity controls can be expanded when needed.
          </p>
        ),
      },
    ],
  },
};
