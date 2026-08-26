import type { Meta, StoryObj } from '@storybook/react-vite';
import { StemPlayer } from '@tahti-web/components/StemPlayer';

/**
 * Each stem is a plain `<audio src>` — Storybook has no real stem audio
 * files to point at, so these use short public-domain sample clips just
 * so the transport buttons have something to actually play/pause rather
 * than silently no-op on a 404.
 */
const meta: Meta<typeof StemPlayer> = {
  title: 'Tahti/Player/StemPlayer',
  component: StemPlayer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Grieg_Piano_Concerto_-_1._Allegro_molto_moderato.ogg/Grieg_Piano_Concerto_-_1._Allegro_molto_moderato.ogg.mp3';

export const FourStems: Story = {
  args: {
    files: [
      { label: 'Master', url: SAMPLE_URL },
      { label: 'Vocals', url: SAMPLE_URL },
      { label: 'Drums', url: SAMPLE_URL },
      { label: 'Bass', url: SAMPLE_URL },
    ],
  },
};

export const TwoStems: Story = {
  args: {
    files: [
      { label: 'Master', url: SAMPLE_URL },
      { label: 'Instrumental', url: SAMPLE_URL },
    ],
  },
};

export const Empty: Story = {
  name: 'Empty (renders nothing)',
  args: {
    files: [],
  },
};
