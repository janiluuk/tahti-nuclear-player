import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export type SectionTabsItem = {
  id: string;
  to: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
};

/** A section's page list as a row of small icon tabs, meant to sit
 * directly below a primary section-tabs row (see AdminNav.tsx's
 * AdminPageLayout) — not a left-docked sidebar column. Always a
 * horizontal row regardless of viewport width (icon + label wrap onto
 * their own line together if the row runs out of space), smaller than
 * the primary tabs above it so the two rows read as tab → sub-tab. */
export function SectionTabs({
  items,
  'aria-label': ariaLabel,
}: {
  items: SectionTabsItem[];
  'aria-label': string;
}) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-2" role="tablist">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          role="tab"
          aria-selected={item.active}
          aria-current={item.active ? 'page' : undefined}
          className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-semibold whitespace-nowrap ${
            item.active
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
          }`}
        >
          <span className="shrink-0 [&>svg]:size-3.5">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
