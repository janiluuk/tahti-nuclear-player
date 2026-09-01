import { render } from '@testing-library/react';

import { TahtiJamSearchDrawer } from './TahtiJamSearchDrawer';
import { TahtiJamSearchDrawerEmpty } from './TahtiJamSearchDrawerEmpty';
import { TahtiJamSearchDrawerError } from './TahtiJamSearchDrawerError';
import { TahtiJamSearchDrawerResults } from './TahtiJamSearchDrawerResults';

describe('TahtiJamSearchDrawer', () => {
  it('(Snapshot) renders nothing when closed', () => {
    const { container } = render(
      <TahtiJamSearchDrawer open={false}>
        <div>Hidden content</div>
      </TahtiJamSearchDrawer>,
    );
    expect(container).toMatchSnapshot();
  });

  it('(Snapshot) renders the sheet and backdrop with results', () => {
    const { container } = render(
      <TahtiJamSearchDrawer open>
        <TahtiJamSearchDrawerResults>
          <div>First result</div>
          <div>Second result</div>
        </TahtiJamSearchDrawerResults>
      </TahtiJamSearchDrawer>,
    );
    expect(container).toMatchSnapshot();
  });

  it('(Snapshot) renders the empty state', () => {
    const { container } = render(
      <TahtiJamSearchDrawer open>
        <TahtiJamSearchDrawerEmpty
          labels={{
            title: 'No results',
            description: 'Try a different search',
          }}
        />
      </TahtiJamSearchDrawer>,
    );
    expect(container).toMatchSnapshot();
  });

  it('(Snapshot) renders the error state', () => {
    const { container } = render(
      <TahtiJamSearchDrawer open>
        <TahtiJamSearchDrawerError
          labels={{
            title: 'Search failed',
            description: 'Check the player and try again',
          }}
        />
      </TahtiJamSearchDrawer>,
    );
    expect(container).toMatchSnapshot();
  });
});
