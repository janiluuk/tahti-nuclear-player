import { Link } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';

import { cn } from '../../utils';
import { Tooltip } from '../Tooltip/Tooltip';
import { useSidebarCompact } from './SidebarCompactContext';

type SidebarNavigationItemProps = {
  icon: ReactNode;
  label: string;
  isSelected?: boolean;
  to?: string;
  onClick?: () => void;
};

const MaybeNavLink: FC<{
  to?: string;
  isSelected?: boolean;
  children: (isSelected: boolean) => ReactNode;
}> = ({ to, isSelected = false, children }) => {
  if (to) {
    // TanStack Router's default active class ('active') is only applied
    // when the Link has no explicit `activeProps` of its own -- passing
    // one here to add `aria-current` replaces that default outright
    // rather than merging with it, so it has to be restated explicitly.
    return (
      <Link
        to={to}
        activeProps={{ className: 'active', 'aria-current': 'page' }}
      >
        {({ isActive }) => children(isActive)}
      </Link>
    );
  }
  return <>{children(isSelected)}</>;
};

export const SidebarNavigationItem: FC<SidebarNavigationItemProps> = ({
  icon,
  label,
  isSelected,
  to,
  onClick,
}) => {
  const isCompact = useSidebarCompact();

  return (
    <MaybeNavLink to={to} isSelected={isSelected}>
      {(routeActive) => {
        const active = isSelected ?? routeActive;

        return (
          <Tooltip content={label} side="right" disabled={!isCompact}>
            <div
              role={onClick ? 'button' : undefined}
              onClick={onClick}
              data-testid="sidebar-navigation-item"
              className={cn(
                'flex w-full items-center overflow-hidden rounded-md border-(length:--border-width)',
                {
                  'cursor-pointer': onClick,
                  'bg-primary text-primary-foreground border-border font-bold':
                    active,
                  'hover:bg-background-secondary border-transparent': !active,
                },
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center">
                {icon}
              </div>
              {!isCompact && (
                <span className="text-sm whitespace-nowrap">{label}</span>
              )}
              {isCompact && <span className="sr-only">{label}</span>}
            </div>
          </Tooltip>
        );
      }}
    </MaybeNavLink>
  );
};
