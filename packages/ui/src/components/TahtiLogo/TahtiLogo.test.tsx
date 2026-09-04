import { render, screen } from '@testing-library/react';

import { TahtiLogo } from './TahtiLogo';

describe('TahtiLogo', () => {
  it('(Snapshot) renders the wordmark', () => {
    const { container } = render(<TahtiLogo />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('(Snapshot) renders the mark only', () => {
    const { container } = render(<TahtiLogo markOnly />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('shows the TAHTI wordmark unless markOnly', () => {
    const { rerender } = render(<TahtiLogo />);
    expect(screen.getByText('TAHTI')).toBeInTheDocument();
    rerender(<TahtiLogo markOnly />);
    expect(screen.queryByText('TAHTI')).not.toBeInTheDocument();
  });
});
