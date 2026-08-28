import { Link } from '@tanstack/react-router';

import { cn } from '../lib/cn';

/** Tahti wordmark shared with the sibling Tahti website. */
export function TahtiLogo({
  className,
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-display inline-flex items-center gap-2 tracking-[0.25em]',
        className,
      )}
    >
      <span aria-hidden className="bg-accent-orange h-5 w-0.75 shrink-0" />
      {!markOnly && (
        <span className="text-base leading-none font-bold uppercase">
          TAHTI
        </span>
      )}
    </span>
  );
}

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
