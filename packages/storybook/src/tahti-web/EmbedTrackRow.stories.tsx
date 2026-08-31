import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmbedTrackRow } from '@tahti-web/components/EmbedTrackRow';

const meta: Meta<typeof EmbedTrackRow> = {
  title: 'Tahti/Media/EmbedTrackRow',
  component: EmbedTrackRow,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ul className="flex max-w-md flex-col gap-2">
        <Story />
      </ul>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Hearthis: Story = {
  args: {
    title: 'Late Night Session',
    provider: 'HEARTHIS',
    embedUri: 'late-night-session',
  },
};

export const Mixcloud: Story = {
  args: {
    title: 'Deep House Mix',
    provider: 'MIXCLOUD',
    embedUri: 'northern-lights/deep-house-mix',
  },
};

export const Spotify: Story = {
  args: {
    title: 'Aurora',
    provider: 'SPOTIFY',
    embedUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
  },
};

export const Bandcamp: Story = {
  args: {
    title: 'Downtempo EP',
    provider: 'BANDCAMP',
    embedUri: 'album=1234567890',
  },
};
