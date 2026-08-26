import type { Meta, StoryObj } from '@storybook/react-vite';
import { WaveformMinimap } from '@tahti-web/components/WaveformMinimap';

function generatePeaks(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const base = Math.abs(Math.sin(i / 7) * 0.6 + Math.sin(i / 23) * 0.3);
    return Math.max(0.05, Math.min(1, base + (i % 5 === 0 ? 0.15 : 0)));
  });
}

const PEAKS = generatePeaks(200);

const meta: Meta<typeof WaveformMinimap> = {
  title: 'Tahti/Widgets/WaveformMinimap',
  component: WaveformMinimap,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  render: (args) => (
    <div style={{ width: 640 }}>
      <WaveformMinimap {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    peaks: PEAKS,
    viewStart: 0.2,
    viewEnd: 0.45,
    onSeek: () => {},
  },
};

export const ZoomedOutFullView: Story = {
  args: {
    peaks: PEAKS,
    viewStart: 0,
    viewEnd: 1,
    onSeek: () => {},
  },
};

export const NarrowZoomWindow: Story = {
  args: {
    peaks: PEAKS,
    viewStart: 0.75,
    viewEnd: 0.8,
    onSeek: () => {},
  },
};
