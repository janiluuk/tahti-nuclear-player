import type { LucideIcon } from 'lucide-react';

import { Button } from '@nuclearplayer/ui';

export type ModerationTabItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type ModerationTabsProps = {
  activeId: string;
  items: ModerationTabItem[];
  onChange: (id: string) => void;
  ariaLabel?: string;
};

export const ModerationTabs = ({
  activeId,
  items,
  onChange,
  ariaLabel,
}: ModerationTabsProps) => (
  <nav className="flex flex-wrap gap-2" role="tablist" aria-label={ariaLabel}>
    {items.map((item) => {
      const Icon = item.icon;
      const selected = activeId === item.id;
      return (
        <Button
          key={item.id}
          type="button"
          variant="text"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(item.id)}
          className={`h-8 rounded-md px-2.5 text-xs font-semibold tracking-wide uppercase ${
            selected
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'border-border text-foreground-secondary hover:text-foreground border'
          }`}
        >
          <Icon size={14} aria-hidden />
          {item.label}
        </Button>
      );
    })}
  </nav>
);
