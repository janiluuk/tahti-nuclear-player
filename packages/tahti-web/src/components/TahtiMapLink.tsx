import { Link } from '@tanstack/react-router';

import { diagnosticsEnabled } from '../lib/buildPolicy';

/**
 * Breadcrumb to `/more` (the Tahti feature map). `/more` redirects to `/`
 * when diagnostics are disabled — the production default — so this renders
 * nothing there instead of linking somewhere that immediately bounces.
 */
export function TahtiMapLink({
  label = '← Tahti map',
  className = 'text-foreground-secondary text-xs hover:underline',
}: {
  label?: string;
  className?: string;
}) {
  if (!diagnosticsEnabled) {
    return null;
  }
  return (
    <Link to="/more" className={className}>
      {label}
    </Link>
  );
}
