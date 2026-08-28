import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export type SectionSidebarItem = {
  id: string;
  to: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
};

export function SectionSidebar({
  items,
  'aria-label': ariaLabel,
}: {
  items: SectionSidebarItem[];
  'aria-label': string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex shrink-0 gap-1 overflow-x-auto sm:w-44 sm:flex-col sm:overflow-visible"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          activeOptions={{ exact: true }}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
            item.active
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
          }`}
          aria-current={item.active ? 'page' : undefined}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
