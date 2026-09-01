import { FC, ReactNode } from 'react';

import { cn } from '../../utils';

export type TahtiJamProps = {
  children: ReactNode;
  className?: string;
};

export const TahtiJamRoot: FC<TahtiJamProps> = ({ children, className }) => (
  <div
    className={cn(
      'bg-background text-foreground flex h-dvh flex-col overflow-hidden',
      className,
    )}
  >
    {children}
  </div>
);
