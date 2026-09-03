import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelBackdropCard } from '@tahti-web/components/ChannelBackdropCard';

const meta: Meta<typeof ChannelBackdropCard> = {
  title: 'Tahti/Channel/ChannelBackdropCard',
  component: ChannelBackdropCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    displayName: 'Northern Lights',
    username: 'northern-lights',
    channelSlug: 'northern-lights',
    bio: 'Ambient / downtempo, streaming most weeknights.',
    accent: '#22D3EE',
    highlight: '#A78BFA',
    bg: '#120B08',
    fg: '#FFF7ED',
    visualPreset: 'AURORA',
    minHeightClassName: 'min-h-96',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Gradient: Story = {
  args: {
    headerStyle: 'GRADIENT',
  },
};

export const Solid: Story = {
  args: {
    headerStyle: 'SOLID',
  },
};

export const VisualizerFallback: Story = {
  name: 'Visualizer fallback (no header style set)',
  args: {
    headerStyle: '',
    artworkUrl: 'https://picsum.photos/seed/tahti-channel/512',
  },
};

export const Editable: Story = {
  name: 'Editable (Channel Designer preview)',
  args: {
    headerStyle: 'GRADIENT',
    editable: true,
    identitySelected: true,
    onEditIdentity: () => {},
    onEditBackground: () => {},
    badge: (
      <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-[10px] font-bold tracking-wide uppercase">
        Live
      </span>
    ),
  },
};
