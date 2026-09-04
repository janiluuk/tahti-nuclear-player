import { Link } from '@tanstack/react-router';

import { TahtiLogo } from '@tahti-player/ui';

import { cn } from '../lib/cn';

export { TahtiLogo, TahtiMark } from '@tahti-player/ui';

export function TahtiLogoLink({
  className,
  markOnly,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn('hover:opacity-90', className)}
      aria-label="Tahti home"
    >
      <TahtiLogo markOnly={markOnly} />
    </Link>
  );
}
