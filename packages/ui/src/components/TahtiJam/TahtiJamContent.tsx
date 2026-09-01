import { FC, ReactNode } from 'react';

import { cn } from '../../utils';

export type TahtiJamContentProps = {
  children: ReactNode;
  className?: string;
};

export const TahtiJamContent: FC<TahtiJamContentProps> = ({
  children,
  className,
}) => (
  <div className={cn('relative flex min-h-0 flex-1 flex-col', className)}>
    {children}
  </div>
);
