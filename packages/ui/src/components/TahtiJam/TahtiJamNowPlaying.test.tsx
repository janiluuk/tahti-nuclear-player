import { render, screen } from '@testing-library/react';

import { TahtiJamNowPlaying } from './TahtiJamNowPlaying';

describe('TahtiJamNowPlaying', () => {
  it('(Snapshot) renders with cover art', () => {
    const { container } = render(
      <TahtiJamNowPlaying
        title="Weird Fishes"
        artist="Radiohead"
        coverUrl="https://example.com/cover.jpg"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('omits the artist when none is given', () => {
    render(<TahtiJamNowPlaying title="Weird Fishes" />);

    expect(screen.queryByTestId('now-playing-artist')).not.toBeInTheDocument();
  });

  it('shows a placeholder when there is no cover art', () => {
    render(<TahtiJamNowPlaying title="Weird Fishes" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
