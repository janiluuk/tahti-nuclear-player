import { Link } from '@tanstack/react-router';
import { StarIcon } from 'lucide-react';

import { cn } from '../lib/cn';

/** Round badge mark — same neobrutalist depth (border + offset shadow) as
 * the rest of the design system's buttons/cards, so it reads as a real
 * logo chip rather than a plain icon. */
export function TahtiMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-primary text-primary-foreground border-border shadow-shadow flex size-8 shrink-0 items-center justify-center rounded-full border-(length:--border-width)',
        className,
      )}
    >
      <StarIcon size={16} strokeWidth={2.5} fill="currentColor" />
    </span>
  );
}

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
      <TahtiMark />
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
