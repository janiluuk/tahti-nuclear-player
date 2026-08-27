import {
  CircleDollarSignIcon,
  FileAudioIcon,
  FolderOpenIcon,
  LayoutGridIcon,
  LibraryIcon,
  ListMusicIcon,
  RadioIcon,
  RadioTowerIcon,
  Settings2Icon,
  SettingsIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  UploadIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

const SUBMENUS = {
  '/studio': [],
  '/library': [
    { to: '/library', label: 'Overview', icon: <LibraryIcon size={16} /> },
    {
      to: '/studio/archive',
      label: 'Archive',
      icon: <FolderOpenIcon size={16} />,
    },
    {
      to: '/studio/releases',
      label: 'Releases',
      icon: <ListMusicIcon size={16} />,
    },
    {
      to: '/studio/collections',
      label: 'Collections',
      icon: <ListMusicIcon size={16} />,
    },
    {
      to: '/studio/playlists',
      label: 'Playlists',
      icon: <ListMusicIcon size={16} />,
    },
    {
      to: '/studio/recordings',
      label: 'Recordings',
      icon: <FileAudioIcon size={16} />,
    },
    { to: '/studio/upload', label: 'Upload', icon: <UploadIcon size={16} /> },
    {
      to: '/studio/editor',
      label: 'Editor',
      icon: <SlidersHorizontalIcon size={16} />,
    },
    { to: '/studio/stash', label: 'Stash', icon: <FolderOpenIcon size={16} /> },
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
    { to: '/studio/venues', label: 'Venues', icon: <RadioIcon size={16} /> },
    { to: '/studio/shows', label: 'Shows', icon: <RadioIcon size={16} /> },
  ],
  '/studio/stats': [
    { to: '/studio/stats', label: 'Stats', icon: <TrendingUpIcon size={16} /> },
    {
      to: '/studio/updates',
      label: 'Updates',
      icon: <TrendingUpIcon size={16} />,
    },
    {
      to: '/studio/distribution',
      label: 'Distribution',
      icon: <TrendingUpIcon size={16} />,
    },
    {
      to: '/studio/insights',
      label: 'Insights',
      icon: <TrendingUpIcon size={16} />,
    },
  ],
  '/studio/revenue': [
    {
      to: '/studio/revenue',
      label: 'Fanbase',
      icon: <CircleDollarSignIcon size={16} />,
    },
  ],
  '/studio/channel': [
    {
      to: '/studio/channel',
      label: 'Channel',
      icon: <Settings2Icon size={16} />,
    },
    {
      to: '/studio/branding',
      label: 'Branding',
      icon: <SettingsIcon size={16} />,
    },
    {
      to: '/studio/moderation',
      label: 'Moderation',
      icon: <SettingsIcon size={16} />,
    },
    {
      to: '/studio/setup-channel',
      label: 'Setup channel',
      icon: <SettingsIcon size={16} />,
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

const isSubmenuActive = (current: string | undefined, to: string) =>
  to === '/library' ? current === to : isActive(current, to);

export const StudioNav = ({ current }: { current?: string }) => (
  <StudioNavigation current={current} />
);

function StudioNavigation({ current }: { current?: string }) {
  const routeSection = PRIMARY.find((item) => isActive(current, item.to));
  const [selectedSection, setSelectedSection] = useState(
    routeSection?.to ?? '/studio',
  );

  useEffect(() => {
    if (routeSection) {
      setSelectedSection(routeSection.to);
    }
  }, [routeSection]);

  const submenu = SUBMENUS[selectedSection as keyof typeof SUBMENUS] ?? [];

  return (
    <>
      <div
        aria-label="Studio sections"
        className="border-border flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border p-1"
        role="tablist"
        data-studio-section-tabs
      >
        {PRIMARY.map((item) => {
          const active = item.to === selectedSection;
          return (
            <button
              key={item.to}
              type="button"
              role="tab"
              aria-selected={active}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
              }`}
              onClick={() => setSelectedSection(item.to)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {submenu.length > 0 && (
        <div data-studio-section-menu>
          <SectionSidebar
            aria-label={`${PRIMARY.find((item) => item.to === selectedSection)?.label ?? 'Studio'} pages`}
            items={submenu.map((item) => ({
              id: item.to,
              label: item.label,
              icon: item.icon,
              to: item.to,
              active: isSubmenuActive(current, item.to),
            }))}
          />
        </div>
      )}
    </>
  );
}
