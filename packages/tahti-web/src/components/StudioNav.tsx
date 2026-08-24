import { Link } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  CircleDollarSignIcon,
  CloudUploadIcon,
  DiscIcon,
  DoorOpenIcon,
  FolderLockIcon,
  GalleryVerticalEndIcon,
  LayoutGridIcon,
  LibraryIcon,
  ListMusicIcon,
  LockKeyholeIcon,
  MegaphoneIcon,
  PaletteIcon,
  RadioTowerIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SignalIcon,
  SparklesIcon,
  TicketIcon,
  TrendingUpIcon,
  type LucideIcon,
} from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

import { cn } from '@nuclearplayer/ui';

import type { TourStep } from '../lib/pageTour';
import { useTourStore } from '../stores/tourStore';
import { InPageNav } from './InPageNav';

const PRIMARY = [
  {
    to: '/studio',
    label: 'Overview',
    description:
      'Your channel snapshot — status, quick links, and recent activity.',
  },
  {
    to: '/studio/go-live',
    label: 'Go Live',
    description: 'Start broadcasting and manage your live stream setup.',
  },
  {
    to: '/library',
    label: 'My Library',
    description: 'All your uploaded tracks, releases, and files in one place.',
  },
  {
    to: '/studio/shows',
    label: 'Shows',
    description: 'Book and manage scheduled radio slots and episodes.',
  },
] as const;

type StudioTool = {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
  section?: string;
};

type StudioToolGroup = {
  label: string;
  icon: LucideIcon;
  tools: readonly StudioTool[];
};

const TOOL_GROUPS: readonly StudioToolGroup[] = [
  {
    label: 'Music',
    icon: SparklesIcon,
    tools: [
      {
        to: '/studio/archive',
        label: 'Music',
        icon: ListMusicIcon,
        description: 'Your full catalog — play, edit, and manage every track.',
      },
      {
        to: '/studio/upload',
        label: 'Upload',
        icon: CloudUploadIcon,
        description: 'Add a new track, set, or release to your library.',
      },
      {
        to: '/studio/collections',
        label: 'Collections',
        icon: LibraryIcon,
        description:
          'Albums, EPs, DJ sets, and playlists — create and design them.',
      },
      {
        to: '/studio/recordings',
        label: 'Recordings',
        icon: DiscIcon,
        description: 'Captures saved from your own broadcasts.',
      },
      {
        to: '/studio/editor',
        label: 'Audio editor',
        icon: AudioLinesIcon,
        description: 'Trim, normalize, and clean up tracks before publishing.',
      },
    ],
  },
  {
    label: 'Plan',
    icon: CalendarDaysIcon,
    tools: [
      {
        to: '/studio/schedule',
        label: 'Schedule',
        icon: CalendarDaysIcon,
        description: 'Your 24/7 channel playlist and rotation settings.',
      },
      {
        to: '/studio/events',
        label: 'Events',
        icon: TicketIcon,
        description: 'Upcoming shows and events tied to your channel.',
      },
      {
        to: '/studio/venues',
        label: 'Venues',
        icon: RadioTowerIcon,
        description: 'Venues you’ve played or registered with Tahti.',
      },
    ],
  },
  {
    label: 'Grow',
    icon: TrendingUpIcon,
    tools: [
      {
        to: '/studio/stats',
        label: 'Stats',
        icon: SignalIcon,
        description:
          'Plays, downloads, listeners by country, and broadcast time.',
      },
      {
        to: '/studio/revenue',
        label: 'Revenue',
        icon: CircleDollarSignIcon,
        description: 'Fan subscriptions, payouts, and Stripe Connect status.',
      },
      {
        to: '/studio/updates',
        label: 'Updates',
        icon: MegaphoneIcon,
        description: 'Post news and newsletters to your followers.',
      },
      {
        to: '/settings/broadcast',
        label: 'Green room',
        icon: DoorOpenIcon,
        section: 'Member content',
        description: 'A members-only chat space before and during broadcasts.',
      },
      {
        to: '/studio/stash',
        label: 'Stash',
        icon: FolderLockIcon,
        section: 'Member content',
        description: 'Private files shared with paying subscribers only.',
      },
      {
        to: '/studio/shows',
        label: 'Exclusive shows',
        icon: LockKeyholeIcon,
        section: 'Member content',
        description: 'Shows and episodes gated to your paying members.',
      },
    ],
  },
  {
    label: 'Manage',
    icon: Settings2Icon,
    tools: [
      {
        to: '/studio/channel',
        label: 'Channel design',
        icon: PaletteIcon,
        description: 'Look, 24/7 radio, profile, and domain for your channel.',
      },
      {
        to: '/studio/branding',
        label: 'Branding & press kit',
        icon: GalleryVerticalEndIcon,
        description: 'Profile picture, gallery, and a downloadable press kit.',
      },
      {
        to: '/studio/moderation',
        label: 'Moderation',
        icon: ShieldCheckIcon,
        description: 'Add channel moderators and manage chat bans.',
      },
    ],
  },
];

const ALL_TOOLS = TOOL_GROUPS.flatMap((group) => group.tools);

export const STUDIO_NAV_TOUR_STEPS: TourStep[] = [
  ...PRIMARY.map(
    (item): TourStep => ({
      id: `nav-item-${item.to}`,
      label: item.label,
      description: item.description,
    }),
  ),
  ...ALL_TOOLS.map(
    (tool): TourStep => ({
      id: `nav-item-tool-${tool.label}`,
      label: tool.label,
      description: tool.description,
    }),
  ),
];

const isActive = (current: string | undefined, to: string) =>
  current === to || (to !== '/studio' && Boolean(current?.startsWith(to)));

export const StudioNav = ({ current }: { current?: string }) => {
  const [toolsOpen, setToolsOpen] = useState(() =>
    ALL_TOOLS.some((tool) => isActive(current, tool.to)),
  );
  const tourOpen = useTourStore((s) => s.open);

  // The page tour (H key) walks through every studio tool, so make sure
  // they're actually mounted to highlight instead of hidden behind the
  // collapsed "Studio tools" panel.
  useEffect(() => {
    if (tourOpen) {
      setToolsOpen(true);
    }
  }, [tourOpen]);

  return (
    <div className="flex flex-col gap-2">
      <InPageNav
        aria-label="Studio"
        items={PRIMARY.map((link) => ({
          id: link.to,
          label: link.label,
          to: link.to,
          active: isActive(current, link.to),
        }))}
      />
      <div className="border-border overflow-hidden rounded-lg border">
        <button
          type="button"
          className="bg-background-secondary/40 hover:bg-background-secondary flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase transition-colors"
          aria-expanded={toolsOpen}
          onClick={() => setToolsOpen((open) => !open)}
        >
          <LayoutGridIcon size={15} aria-hidden className="text-primary" />
          <span className="flex-1">Studio tools</span>
          <ChevronDownIcon
            size={15}
            aria-hidden
            className={cn('transition-transform', toolsOpen && 'rotate-180')}
          />
        </button>
        {toolsOpen ? (
          <div
            role="region"
            aria-label="Studio tool groups"
            className="border-border grid gap-px border-t bg-(--border) sm:grid-cols-2 lg:grid-cols-4"
          >
            {TOOL_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <section
                  key={group.label}
                  className="bg-background flex min-w-0 flex-col gap-1 p-2"
                >
                  <h2 className="text-foreground-secondary flex items-center gap-2 px-2 py-1 text-[11px] font-semibold tracking-widest uppercase">
                    <GroupIcon size={14} aria-hidden />
                    {group.label}
                  </h2>
                  {group.tools.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    const active = isActive(current, tool.to);
                    const showSection =
                      tool.section &&
                      group.tools[index - 1]?.section !== tool.section;
                    return (
                      <Fragment key={`${tool.to}-${tool.label}`}>
                        {showSection ? (
                          <h3 className="text-foreground-secondary mt-2 px-2 pt-2 text-[10px] font-semibold tracking-widest uppercase">
                            {tool.section}
                          </h3>
                        ) : null}
                        <Link
                          to={tool.to}
                          data-tour-id={`nav-item-tool-${tool.label}`}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                            active
                              ? 'bg-primary text-foreground font-semibold'
                              : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground',
                          )}
                        >
                          <ToolIcon size={15} aria-hidden />
                          <span className="truncate">{tool.label}</span>
                        </Link>
                      </Fragment>
                    );
                  })}
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};
