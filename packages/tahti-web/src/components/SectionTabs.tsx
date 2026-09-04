import { useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { TabLabel, Tabs } from '@tahti-player/ui';

export type SectionTabsItem = {
  id: string;
  to: string;
  label: string;
  icon: ReactNode;
  count?: number;
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
  const navigate = useNavigate();
  const selectedIndex = items.findIndex((item) => item.active);

  return (
    <Tabs.Root
      selectedIndex={Math.max(0, selectedIndex)}
      onChange={(index) => {
        const next = items[index];
        if (next) {
          void navigate({ to: next.to as never });
        }
      }}
      tabClassName={
        selectedIndex < 0
          ? 'data-[selected]:bg-transparent data-[selected]:text-foreground-secondary'
          : undefined
      }
    >
      <Tabs.List aria-label={ariaLabel} className="w-fit flex-wrap">
        {items.map((item) => (
          <Tabs.Tab key={item.id}>
            <TabLabel icon={item.icon} count={item.count}>
              {item.label}
            </TabLabel>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
