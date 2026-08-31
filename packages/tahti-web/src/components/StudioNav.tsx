import { Link, useRouterState } from '@tanstack/react-router';
import {
  HeartIcon,
  LandmarkIcon,
  LayersIcon,
  LayoutGridIcon,
  LibraryIcon,
  ListMusicIcon,
  RadioIcon,
  RadioTowerIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  UploadIcon,
} from 'lucide-react';

import { SidebarNavigationItem } from '@nuclearplayer/ui';

import type { TourStep } from '../lib/pageTour';
import { matchesSectionRoute } from '../lib/sectionNavigation';

const PRIMARY = [
  {
    to: '/studio',
    label: 'Studio',
    icon: <LayoutGridIcon size={16} aria-hidden />,
    description:
      'Your channel snapshot — status, quick links, and recent activity.',
  },
  {
    to: '/library',
    label: 'Library',
    icon: <LibraryIcon size={16} aria-hidden />,
    description: 'All your uploaded tracks, releases, and files in one place.',
  },
  {
    to: '/studio/go-live',
    label: 'Perform',
    icon: <RadioTowerIcon size={16} aria-hidden />,
    description: 'Go live, schedule broadcasts, and manage performances.',
  },
] as const;

const SUBMENUS = {
  '/studio': [
    { to: '/studio', label: 'Overview', icon: <LayoutGridIcon size={16} /> },
    { to: '/studio/stats', label: 'Stats', icon: <TrendingUpIcon size={16} /> },
    {
      to: '/studio/governance',
      label: 'Governance',
      icon: <LandmarkIcon size={16} />,
    },
    {
      to: '/studio/updates',
      label: 'Posts',
      icon: <TrendingUpIcon size={16} />,
    },
    {
      to: '/studio/distribution',
      label: 'Distribution',
      icon: <TrendingUpIcon size={16} />,
    },
    {
      to: '/studio/revenue',
      label: 'Audience',
      icon: <HeartIcon size={16} />,
    },
  ],
  '/library': [
    { to: '/library', label: 'Overview', icon: <LibraryIcon size={16} /> },
    {
      to: '/library/sounds',
      label: 'Sounds',
      icon: <ListMusicIcon size={16} />,
    },
    {
      to: '/library/collections',
      label: 'Collections',
      icon: <LayersIcon size={16} />,
    },
    {
      to: '/studio/releases',
      label: 'Releases',
      icon: <ListMusicIcon size={16} />,
    },
    { to: '/library/upload', label: 'Upload', icon: <UploadIcon size={16} /> },
    {
      to: '/studio/editor',
      label: 'Editor',
      icon: <SlidersHorizontalIcon size={16} />,
    },
  ],
  '/studio/go-live': [
    {
      to: '/studio/go-live',
      label: 'Go live',
      icon: <RadioTowerIcon size={16} />,
    },
    {
      to: '/studio/schedule',
      label: 'Schedule',
      icon: <RadioIcon size={16} />,
    },
    { to: '/studio/events', label: 'Events', icon: <RadioIcon size={16} /> },
    { to: '/studio/shows', label: 'Shows', icon: <RadioIcon size={16} /> },
    {
      to: '/studio/channel?tab=multicast',
      label: 'Multicast',
      icon: <RadioTowerIcon size={16} />,
    },
    {
      to: '/studio/channel',
      label: 'Channel',
      icon: <Settings2Icon size={16} />,
    },
    {
      to: '/studio/channel?tab=radio',
      label: 'Radio',
      icon: <RadioIcon size={16} />,
    },
  ],
} as const;

export const STUDIO_NAV_TOUR_STEPS: TourStep[] = PRIMARY.map(
  (item): TourStep => ({
    id: `nav-item-${item.to}`,
    label: item.label,
    description: item.description,
  }),
);

const SECTION_PREFIXES: Record<string, readonly string[]> = {
  '/studio': [
    '/studio',
    '/studio/stats',
    '/studio/governance',
    '/studio/updates',
    '/studio/distribution',
    '/studio/revenue',
  ],
  '/library': [
    '/library',
    '/studio/archive',
    '/studio/releases',
    '/library/collections',
    '/studio/collections',
    '/library/recordings',
    '/library/smartlinks',
    '/library/upload',
    '/studio/editor',
    '/studio/mastering',
    '/studio/stash',
    '/studio/playlists',
  ],
  '/studio/go-live': [
    '/studio/go-live',
    '/studio/info',
    '/studio/schedule',
    '/studio/events',
    '/studio/shows',
    '/studio/channel',
  ],
};

const isActive = (current: string | undefined, to: string) => {
  if (!current) {
    return false;
  }
  if (to === '/studio/go-live' && current === '/studio/channel?tab=multicast') {
    return true;
  }
  const pathname = current.split('?')[0];
  if (to === '/studio') {
    return (
      pathname === '/studio' ||
      matchesSectionRoute(
        pathname,
        SECTION_PREFIXES[to].filter((prefix) => prefix !== '/studio'),
      )
    );
  }
  return matchesSectionRoute(pathname, SECTION_PREFIXES[to] ?? [to]);
};

export const getStudioPrimaryRoute = (current: string | undefined) =>
  PRIMARY.find((item) => isActive(current, item.to))?.to ?? null;

const isSubmenuActive = (current: string | undefined, to: string) =>
  (to.includes('?')
    ? current === to
    : to === '/library' || to === '/studio'
      ? current === to
      : current === to || current?.startsWith(`${to}/`) === true) ||
  (to === '/studio/releases' && current === '/library/releases') ||
  (to === '/library/sounds' && current?.startsWith('/studio/archive')) ||
  (to === '/library/collections' &&
    (current === '/studio/collections' ||
      current?.startsWith('/studio/collections/') === true ||
      current?.startsWith('/studio/playlists/') === true)) ||
  (to === '/studio/recordings' && current === '/library/recordings') ||
  (to === '/library/history' && current === '/library/history');

export const StudioNav = ({
  current,
  global = false,
}: {
  current?: string;
  global?: boolean;
}) => (global ? <StudioNavigation current={current} /> : null);

export function StudioMainNavItems() {
  const current = useRouterState({
    select: (state) => state.location.pathname + state.location.searchStr,
  });

  return (
    <div className="flex flex-col gap-2">
      {PRIMARY.filter((item) => item.to !== '/studio').map((item) => (
        <SidebarNavigationItem
          key={item.to}
          to={item.to}
          icon={item.icon}
          label={item.label}
          isSelected={isActive(current, item.to)}
        />
      ))}
    </div>
  );
}

function StudioNavigation({ current }: { current?: string }) {
  const selectedSection = getStudioPrimaryRoute(current) ?? '/studio';

  const submenu = SUBMENUS[selectedSection as keyof typeof SUBMENUS] ?? [];

  return (
    <div className="flex min-w-0 flex-col gap-1" data-studio-navigation>
      <nav
        aria-label={`${PRIMARY.find((item) => item.to === selectedSection)?.label ?? 'Studio'} pages`}
        className="border-border flex min-w-0 flex-wrap gap-1 border-b pb-2"
        data-studio-section-menu
      >
        {submenu.length > 0 &&
          submenu.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              aria-current={
                isSubmenuActive(current, item.to) ? 'page' : undefined
              }
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
                isSubmenuActive(current, item.to)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          ))}
      </nav>
    </div>
  );
}
