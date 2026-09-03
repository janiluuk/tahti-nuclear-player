import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelTextOverlayView } from '@tahti-web/components/ChannelTextOverlayView';

const meta: Meta<typeof ChannelTextOverlayView> = {
  title: 'Tahti/Channel/ChannelTextOverlayView',
  component: ChannelTextOverlayView,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    text: 'New album out now — listen live',
    align: 'CENTER',
    accent: '#22D3EE',
    highlight: '#A78BFA',
  },
  render: (args) => (
    <div className="bg-background-secondary flex min-h-40 items-center justify-center rounded-xl p-6">
      <ChannelTextOverlayView {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GradientShimmer: Story = {
  args: { mode: 'GRADIENT_SHIMMER' },
};

export const CosmicNeon: Story = {
  args: { mode: 'COSMIC_NEON' },
};

export const ShimmerLines: Story = {
  args: { mode: 'SHIMMER_LINES' },
};

export const GhostEcho: Story = {
  args: { mode: 'GHOST_ECHO' },
};

export const LeftAligned: Story = {
  args: { mode: 'GRADIENT_SHIMMER', align: 'LEFT' },
};

export const Small: Story = {
  args: { mode: 'GRADIENT_SHIMMER', size: 'sm' },
};
