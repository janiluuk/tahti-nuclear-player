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
        'font-display text-foreground inline-flex items-center gap-2 text-lg font-medium tracking-[0.25em]',
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-accent-orange h-5 w-[3px] shrink-0 rounded-[1px]"
      />
      {!markOnly && <span className="leading-none uppercase">TAHTI</span>}
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
