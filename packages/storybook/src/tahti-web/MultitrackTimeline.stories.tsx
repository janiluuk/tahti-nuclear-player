import type { Meta, StoryObj } from '@storybook/react-vite';
import type { EditorSource, EditorTimeline } from '@tahti-web/api/studio-types';
import { MultitrackTimeline } from '@tahti-web/components/MultitrackTimeline';
import { useState } from 'react';

const sources: EditorSource[] = [
  {
    sourceKey: 'source-a',
    title: 'Northern Lights',
    url: 'https://cdn.example.test/a.mp3',
    durationSec: 180,
  },
  {
    sourceKey: 'source-b',
    title: 'Glass Cities',
    url: 'https://cdn.example.test/b.mp3',
    durationSec: 120,
  },
];
const makeTimeline = (): EditorTimeline => ({
  version: 1,
  durationSec: 360,
  tracks: [
    {
      id: 'drums',
      name: 'Drums',
      color: '#6ee7b7',
      gainDb: 0,
      muted: false,
      solo: false,
      clips: [
        {
          id: 'drums-clip',
          sourceArchiveItemId: 'source-a',
          startSec: 0,
          sourceOffsetSec: 0,
          durationSec: 180,
        },
      ],
    },
    {
      id: 'texture',
      name: 'Texture',
      color: '#93c5fd',
      gainDb: -3,
      muted: false,
      solo: false,
      clips: [
        {
          id: 'texture-clip',
          sourceArchiveItemId: 'source-b',
          startSec: 90,
          sourceOffsetSec: 0,
          durationSec: 120,
        },
      ],
    },
  ],
});
const empty: EditorTimeline = { version: 1, durationSec: 180, tracks: [] };

const meta = {
  title: 'Tahti/Studio/MultitrackTimeline',
  component: MultitrackTimeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'V1 timeline JSON stores ordered tracks and non-destructive clips: each clip has a source archive item, timeline start, source offset, and duration. Track controls store gain, mute, and solo. The track-control column stacks above the intentional horizontal timeline scroller on narrow screens.',
      },
    },
  },
} satisfies Meta<typeof MultitrackTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;
const Interactive = ({
  initial = makeTimeline(),
}: {
  initial?: EditorTimeline;
}) => {
  const [value, setValue] = useState(initial);
  return (
    <div className="mx-auto w-full max-w-6xl">
      <MultitrackTimeline value={value} sources={sources} onChange={setValue} />
    </div>
  );
};
const storyArgs = { value: makeTimeline(), sources, onChange: () => undefined };
export const SeededSession: Story = {
  args: storyArgs,
  render: () => <Interactive />,
};
export const EmptySession: Story = {
  args: { ...storyArgs, value: empty },
  render: () => <Interactive initial={empty} />,
};
export const UnavailableSource: Story = {
  args: storyArgs,
  render: () => (
    <div className="mx-auto w-full max-w-6xl">
      <MultitrackTimeline
        value={makeTimeline()}
        sources={sources}
        unavailableSourceIds={['source-b']}
        onChange={() => undefined}
      />
    </div>
  ),
};

export const MobileWidth: Story = {
  args: storyArgs,
  render: () => (
    <div className="w-[390px] max-w-full">
      <MultitrackTimeline
        value={makeTimeline()}
        sources={sources}
        onChange={() => undefined}
      />
    </div>
  ),
};
