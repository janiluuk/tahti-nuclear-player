import type { ReactNode } from 'react';

import { SidebarNavigation, SidebarNavigationItem } from '@tahti-player/ui';

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
    <nav aria-label={ariaLabel} className="shrink-0 sm:w-44">
      <SidebarNavigation>
        <div className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
          {items.map((item) => (
            <SidebarNavigationItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isSelected={item.active}
              aria-current={item.active ? 'page' : undefined}
            />
          ))}
        </div>
      </SidebarNavigation>
    </nav>
  );
}
