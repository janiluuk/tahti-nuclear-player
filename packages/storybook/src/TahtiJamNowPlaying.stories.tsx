import type { Meta } from '@storybook/react-vite';

import { TahtiJam } from '@tahti-player/ui';

const meta = {
  title: 'Remote/TahtiJam/NowPlaying',
  component: TahtiJam.NowPlaying,
  tags: ['autodocs'],
} satisfies Meta<typeof TahtiJam.NowPlaying>;

export default meta;

const cover = 'https://picsum.photos/208';

export const WithCoverArt = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.NowPlaying
        title="Everything In Its Right Place"
        artist="Radiohead"
        coverUrl={cover}
      />
    </div>
  ),
};

export const Loading = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.NowPlaying
        title="Everything In Its Right Place"
        artist="Radiohead"
        coverUrl={cover}
        isLoading
      />
    </div>
  ),
};

export const NoCoverArt = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.NowPlaying title="No Cover Art" artist="Unknown Artist" />
    </div>
  ),
};
