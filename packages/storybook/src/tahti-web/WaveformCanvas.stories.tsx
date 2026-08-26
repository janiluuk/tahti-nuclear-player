import type { Meta, StoryObj } from '@storybook/react-vite';
import type { EditCut } from '@tahti-web/api/studio-types';
import { WaveformCanvas } from '@tahti-web/components/WaveformCanvas';
import { useState } from 'react';

// Synthetic peaks stand in for real audio-derived amplitude data (this
// component draws directly from the `peaks` prop, so — unlike the
// canvas-from-live-analyser visualizers — it renders a fully real,
// static waveform here, just from a synthetic source instead of a
// decoded audio file).
function syntheticPeaks(n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const envelope = 0.35 + 0.5 * Math.sin((i / n) * Math.PI);
    const detail = 0.25 * Math.abs(Math.sin(i * 0.35)) + 0.15 * Math.random();
    return Math.max(0.05, Math.min(1, envelope * 0.6 + detail));
  });
}

const peaks = syntheticPeaks(800);
const durationSec = 240;

const meta: Meta<typeof WaveformCanvas> = {
  title: 'Tahti/Player/WaveformCanvas',
  component: WaveformCanvas,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    peaks,
    durationSec,
    currentTime: 62,
    cuts: [],
    selection: null,
    onSeek: () => {},
  },
};

const sampleCuts: EditCut[] = [
  { start: 12, end: 18 },
  { start: 140, end: 152 },
];

export const WithCuts: Story = {
  args: {
    peaks,
    durationSec,
    currentTime: 30,
    cuts: sampleCuts,
    selection: null,
    onSeek: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    peaks,
    durationSec,
    currentTime: 62,
    cuts: sampleCuts,
    selection: { start: 60, end: 95 },
    onSeek: () => {},
  },
};

export const ZoomedIn: Story = {
  name: 'Zoomed window (viewStart/viewEnd)',
  args: {
    peaks,
    durationSec,
    currentTime: 62,
    cuts: sampleCuts,
    selection: null,
    viewStart: 0.2,
    viewEnd: 0.4,
    onSeek: () => {},
  },
};

/** Fully interactive: click/drag to select or seek, wheel to zoom — same
 * wiring the real pro editor uses. */
export const Interactive: Story = {
  render: () => {
    const [currentTime, setCurrentTime] = useState(62);
    const [selection, setSelection] = useState<{
      start: number;
      end: number;
    } | null>(null);
    const [view, setView] = useState({ start: 0, end: 1 });

    return (
      <div className="flex flex-col gap-2">
        <p className="text-foreground-secondary text-xs">
          Click/drag to seek or select a range; scroll/wheel to zoom.
        </p>
        <WaveformCanvas
          peaks={peaks}
          durationSec={durationSec}
          currentTime={currentTime}
          cuts={sampleCuts}
          selection={selection}
          viewStart={view.start}
          viewEnd={view.end}
          onViewChange={(start, end) => setView({ start, end })}
          onSeek={setCurrentTime}
          onSelectRange={(start, end) => setSelection({ start, end })}
        />
        <p className="text-foreground-secondary text-xs">
          Playhead at {currentTime.toFixed(1)}s
          {selection
            ? ` — selection ${selection.start.toFixed(1)}s to ${selection.end.toFixed(1)}s`
            : ''}
        </p>
      </div>
    );
  },
};
