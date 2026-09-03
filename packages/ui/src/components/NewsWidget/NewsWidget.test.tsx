import { render, screen } from '@testing-library/react';

import { NewsWidget } from './NewsWidget';

const labels = { nothingFound: 'No articles right now — check back soon.' };

describe('NewsWidget', () => {
  it('(Snapshot) renders a row of articles', () => {
    const { container } = render(
      <NewsWidget
        title="News"
        items={[
          {
            id: '1',
            title: 'Winter grants',
            teaser: 'Applications are open.',
          },
        ]}
        labels={labels}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('shows the empty label when there are no articles', () => {
    render(<NewsWidget title="News" items={[]} labels={labels} />);
    expect(screen.getByTestId('news-widget-nothing-found')).toHaveTextContent(
      labels.nothingFound,
    );
  });
});
