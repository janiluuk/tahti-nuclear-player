import { render } from '@testing-library/react';

import { TahtiJamConnecting } from './TahtiJamConnecting';

const labels = {
  title: 'Connecting to Nuclear...',
  subtitle: 'Make sure Nuclear is running',
};

describe('TahtiJamConnecting', () => {
  it('(Snapshot) renders with labels', () => {
    const { container } = render(<TahtiJamConnecting labels={labels} />);
    expect(container).toMatchSnapshot();
  });
});
