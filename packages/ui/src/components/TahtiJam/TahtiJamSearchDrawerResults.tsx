import { FC, ReactNode } from 'react';

import { ScrollableArea } from '../ScrollableArea';

export type TahtiJamSearchDrawerResultsProps = {
  children: ReactNode;
};

export const TahtiJamSearchDrawerResults: FC<
  TahtiJamSearchDrawerResultsProps
> = ({ children }) => (
  <div className="relative min-h-0" data-testid="jam-search-results">
    <ScrollableArea viewportClassName="max-h-[60dvh]">
      {children}
    </ScrollableArea>
  </div>
);
