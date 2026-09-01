import { WifiOff } from 'lucide-react';
import { FC } from 'react';

import { cn } from '../../utils';
import { EmptyState } from '../EmptyState';

export type TahtiJamErrorLabels = {
  title: string;
  subtitle: string;
};

type TahtiJamErrorProps = {
  labels: TahtiJamErrorLabels;
  className?: string;
};

export const TahtiJamError: FC<TahtiJamErrorProps> = ({
  labels,
  className,
}) => (
  <EmptyState
    icon={<WifiOff size={48} />}
    title={labels.title}
    description={labels.subtitle}
    className={cn('flex-1', className)}
    data-testid="jam-error"
  />
);
