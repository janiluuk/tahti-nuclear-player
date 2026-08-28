import { Link } from '@tanstack/react-router';

import { LEGAL_HUB_LINKS } from '../content/legal';

export function LegalHubLinks() {
  return (
    <ul className="text-foreground-secondary flex flex-wrap gap-3 text-xs">
      {LEGAL_HUB_LINKS.map((link) => (
        <li key={link.slug}>
          <Link to={link.to} className="underline-offset-2 hover:underline">
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
