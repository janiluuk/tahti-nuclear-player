import type { Meta, StoryObj } from '@storybook/react-vite';
import type {
  TracklistEntry,
  TracklistOverlaySettings,
} from '@tahti-web/api/studio-types';
import { TracklistEditor } from '@tahti-web/components/TracklistEditor';
import { useState } from 'react';

const PEAKS = Array.from({ length: 240 }, (_, index) =>
  Math.max(
    0.08,
    Math.min(
      1,
      Math.abs(Math.sin(index / 8) * 0.62 + Math.sin(index / 19) * 0.3),
    ),
  ),
);

const INITIAL_ENTRIES: TracklistEntry[] = [
  {
    id: 'intro',
    title: 'Intro — Northern Lights',
    artist: 'Northern Lights',
    artistUsername: 'northern-lights',
    startSec: 0,
  },
  {
    id: 'second',
    title: 'Glass Cities',
    artist: 'Mira Sol',
    startSec: 142,
  },
  {
    id: 'third',
    title: 'After the Rain',
    artist: 'Janiho',
    startSec: 305,
  },
];

const INITIAL_OVERLAY: TracklistOverlaySettings = {
  enabled: true,
  preset: 'cards',
};

const meta: Meta<typeof TracklistEditor> = {
  title: 'Tahti/Studio/TracklistEditor',
  component: TracklistEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DJ-set tracklist timeline used in TrackEditDialog (Tracklist tab). It accepts Traktor/text imports, supports waveform pins and drag placement, artist tagging, equal distribution, and current-track overlay presets. Source: packages/tahti-web/src/components/TracklistEditor.tsx.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DJSetTimeline: Story = {
  render: () => {
    const [entries, setEntries] = useState(INITIAL_ENTRIES);
    const [overlay, setOverlay] = useState(INITIAL_OVERLAY);
    return (
      <div className="mx-auto w-full max-w-5xl">
        <TracklistEditor
          durationSec={480}
          peaks={PEAKS}
          value={entries}
          overlay={overlay}
          onChange={setEntries}
          onOverlayChange={setOverlay}
        />
      </div>
    );
  },
};

export const EmptyTracklist: Story = {
  render: () => {
    const [entries, setEntries] = useState<TracklistEntry[]>([]);
    const [overlay, setOverlay] = useState(INITIAL_OVERLAY);
    return (
      <div className="mx-auto w-full max-w-5xl">
        <TracklistEditor
          durationSec={600}
          peaks={PEAKS}
          value={entries}
          overlay={overlay}
          onChange={setEntries}
          onOverlayChange={setOverlay}
        />
      </div>
    );
  },
};
