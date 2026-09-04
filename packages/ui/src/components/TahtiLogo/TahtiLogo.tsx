import { StarIcon } from 'lucide-react';
import { type ComponentProps, type FC } from 'react';

import { cn } from '../../utils';

type TahtiMarkProps = ComponentProps<'span'>;

export const TahtiMark: FC<TahtiMarkProps> = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn(
      'bg-primary text-primary-foreground border-border shadow-shadow flex size-8 shrink-0 items-center justify-center rounded-full border-(length:--border-width)',
      className,
    )}
    {...props}
  >
    <StarIcon size={16} strokeWidth={2.5} fill="currentColor" />
  </span>
);

type TahtiLogoProps = ComponentProps<'span'> & {
  markOnly?: boolean;
};

export const TahtiLogo: FC<TahtiLogoProps> = ({
  className,
  markOnly = false,
  ...props
}) => (
  <span
    className={cn(
      'font-heading text-foreground inline-flex items-center gap-2 text-lg font-medium tracking-[0.25em]',
      className,
    )}
    {...props}
  >
    <TahtiMark />
    {!markOnly && <span className="leading-none uppercase">TAHTI</span>}
  </span>
);
