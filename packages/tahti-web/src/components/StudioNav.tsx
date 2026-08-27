import {
  CircleDollarSignIcon,
  LayoutGridIcon,
  LibraryIcon,
  RadioTowerIcon,
  Settings2Icon,
  TrendingUpIcon,
} from 'lucide-react';

import type { TourStep } from '../lib/pageTour';
import { matchesSectionRoute } from '../lib/sectionNavigation';
import { SectionSidebar } from './SectionSidebar';

const PRIMARY = [
  {
    to: '/studio',
    label: 'Overview',
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
  {
    to: '/studio/stats',
    label: 'Grow',
    icon: <TrendingUpIcon size={16} aria-hidden />,
    description: 'Understand your audience and grow your channel.',
  },
  {
    to: '/studio/revenue',
    label: 'Fanbase',
    icon: <CircleDollarSignIcon size={16} aria-hidden />,
    description: 'Build relationships with fans and members.',
  },
  {
    to: '/studio/channel',
    label: 'Manage',
    icon: <Settings2Icon size={16} aria-hidden />,
    description: 'Manage your channel, branding, and access.',
  },
] as const;

export const STUDIO_NAV_TOUR_STEPS: TourStep[] = PRIMARY.map(
  (item): TourStep => ({
    id: `nav-item-${item.to}`,
    label: item.label,
    description: item.description,
  }),
);

const SECTION_PREFIXES: Record<string, readonly string[]> = {
  '/studio': ['/studio'],
  '/library': [
    '/library',
    '/studio/archive',
    '/studio/releases',
    '/studio/collections',
    '/studio/recordings',
    '/studio/upload',
    '/studio/editor',
    '/studio/stash',
  ],
  '/studio/go-live': [
    '/studio/go-live',
    '/studio/schedule',
    '/studio/events',
    '/studio/venues',
    '/studio/shows',
  ],
  '/studio/stats': [
    '/studio/stats',
    '/studio/updates',
    '/studio/distribution',
    '/studio/insights',
  ],
  '/studio/revenue': ['/studio/revenue'],
  '/studio/channel': [
    '/studio/channel',
    '/studio/branding',
    '/studio/moderation',
    '/studio/setup-channel',
  ],
};

const isActive = (current: string | undefined, to: string) => {
  if (!current) {
    return false;
  }
  if (to === '/studio') {
    return current === to;
  }
  return matchesSectionRoute(current, SECTION_PREFIXES[to] ?? [to]);
};

export const StudioNav = ({ current }: { current?: string }) => (
  <SectionSidebar
    aria-label="Studio"
    items={PRIMARY.map((link) => ({
      id: link.to,
      label: link.label,
      icon: link.icon,
      to: link.to,
      active: isActive(current, link.to),
    }))}
  />
);
