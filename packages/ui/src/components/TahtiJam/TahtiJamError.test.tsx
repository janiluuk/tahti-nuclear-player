import { render } from '@testing-library/react';

import { TahtiJamError } from './TahtiJamError';

const labels = {
  title: 'Could not connect',
  subtitle: 'Make sure Nuclear is running',
};

describe('TahtiJamError', () => {
  it('(Snapshot) renders with labels', () => {
    const { container } = render(<TahtiJamError labels={labels} />);
    expect(container).toMatchSnapshot();
  });
});
