import { TriangleAlert } from 'lucide-react';
import { FC } from 'react';

import { EmptyState } from '../EmptyState';

export type TahtiJamSearchDrawerErrorLabels = {
  title: string;
  description?: string;
};

export type TahtiJamSearchDrawerErrorProps = {
  labels: TahtiJamSearchDrawerErrorLabels;
};

export const TahtiJamSearchDrawerError: FC<TahtiJamSearchDrawerErrorProps> = ({
  labels,
}) => (
  <EmptyState
    icon={<TriangleAlert size={48} />}
    title={labels.title}
    description={labels.description}
    className="flex-1"
    data-testid="jam-search-error"
  />
);
