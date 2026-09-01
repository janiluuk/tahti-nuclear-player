import { render } from '@testing-library/react';

import { TahtiJamSearchBar } from './TahtiJamSearchBar';

const labels = {
  placeholder: 'Search for music',
};

describe('TahtiJamSearchBar', () => {
  it('(Snapshot) renders empty', () => {
    const { container } = render(
      <TahtiJamSearchBar value="" onChange={() => {}} labels={labels} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('(Snapshot) renders with a value', () => {
    const { container } = render(
      <TahtiJamSearchBar
        value="Radiohead"
        onChange={() => {}}
        labels={labels}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
