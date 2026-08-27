import { useNavigate } from '@tanstack/react-router';
import {
  ActivityIcon,
  AlertTriangleIcon,
  BanknoteIcon,
  FileTextIcon,
  FlagIcon,
  GaugeIcon,
  LanguagesIcon,
  MegaphoneIcon,
  RadioIcon,
  ServerIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import type { TourStep } from '../lib/pageTour';
import { matchesSectionRoute } from '../lib/sectionNavigation';
import { SectionSidebar } from './SectionSidebar';

const PRIMARY = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: <GaugeIcon size={16} aria-hidden />,
    description: 'Platform-wide overview — activity, health, and shortcuts.',
  },
  {
    to: '/admin/logs',
    label: 'Logs',
    icon: <FileTextIcon size={16} aria-hidden />,
    description:
      'Live container logs from every service in the production stack.',
  },
  {
    to: '/admin/moderation',
    label: 'Moderation',
    icon: <ShieldCheckIcon size={16} aria-hidden />,
    description:
      'Support, beta applications, radio submissions, Selects, content reports, and feature requests — one tabbed queue.',
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: <UsersIcon size={16} aria-hidden />,
    description: 'Search accounts and edit role, membership, and suspension.',
  },
  {
    to: '/admin/radio',
    label: 'Radio',
    icon: <RadioIcon size={16} aria-hidden />,
    description:
      'Tahti Radio and Tahti Selects rotation, live from the station.',
  },
  {
    to: '/admin/news',
    label: 'News',
    icon: <FileTextIcon size={16} aria-hidden />,
    description: 'Publish platform-wide news posts.',
  },
  {
    to: '/admin/streams',
    label: 'Streams',
    icon: <ServerIcon size={16} aria-hidden />,
    description: 'Monitor live ingest and stream health across channels.',
  },
  {
    to: '/admin/top-lists',
    label: 'Overview',
    icon: <TrophyIcon size={16} aria-hidden />,
    description: 'Editorial top-track and top-artist lists.',
  },
  {
    to: '/admin/announcements',
    label: 'Announcements',
    icon: <MegaphoneIcon size={16} aria-hidden />,
    description: 'Site-wide banners and announcement messages.',
  },
  {
    to: '/admin/storage',
    label: 'Storage',
    icon: <ServerIcon size={16} aria-hidden />,
    description:
      'Disk/object storage space, quotas, and every uploaded file across the platform.',
  },
  {
    to: '/admin/financial',
    label: 'Financial',
    icon: <BanknoteIcon size={16} aria-hidden />,
    description: 'Membership revenue, payouts, and financial records.',
  },
  {
    to: '/admin/governance',
    label: 'Governance',
    icon: <FlagIcon size={16} aria-hidden />,
    description: 'Member votes and cooperative governance items.',
  },
  {
    to: '/admin/grants',
    label: 'Grants',
    icon: <TicketIcon size={16} aria-hidden />,
    description: 'Artist grant program applications and awards.',
  },
  {
    to: '/admin/agm',
    label: 'AGM',
    icon: <UsersIcon size={16} aria-hidden />,
    description: 'Annual general meeting scheduling and records.',
  },
  {
    to: '/admin/missed-shows',
    label: 'Missed shows',
    icon: <AlertTriangleIcon size={16} aria-hidden />,
    description: 'Review scheduled shows that passed without a broadcast.',
  },
  {
    to: '/admin/vendors',
    label: 'Vendors',
    icon: <SettingsIcon size={16} aria-hidden />,
    description: 'Third-party vendor and service accounts.',
  },
  {
    to: '/admin/status',
    label: 'Status',
    icon: <ActivityIcon size={16} aria-hidden />,
    description: 'Platform status page content and incident history.',
  },
  {
    to: '/admin/i18n',
    label: 'Languages',
    icon: <LanguagesIcon size={16} aria-hidden />,
    description: 'Add languages and import translation CSVs.',
  },
  {
    to: '/admin/tahti-selects',
    label: 'Selects',
    icon: <RadioIcon size={16} aria-hidden />,
    description: 'Manage the Tahti Selects editorial stream and rotation.',
  },
] as const;

const ADMIN_SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    items: PRIMARY.filter((item) =>
      ['/admin', '/admin/logs', '/admin/status'].includes(item.to),
    ),
  },
  {
    id: 'community',
    label: 'Community',
    items: PRIMARY.filter((item) =>
      [
        '/admin/moderation',
        '/admin/users',
        '/admin/governance',
        '/admin/grants',
        '/admin/agm',
        '/admin/missed-shows',
      ].includes(item.to),
    ),
  },
  {
    id: 'content',
    label: 'Content',
    items: PRIMARY.filter((item) =>
      [
        '/admin/radio',
        '/admin/news',
        '/admin/top-lists',
        '/admin/announcements',
      ].includes(item.to),
    ).sort((left, right) => {
      if (left.to === '/admin/top-lists') {
        return -1;
      }
      if (right.to === '/admin/top-lists') {
        return 1;
      }
      return 0;
    }),
  },
  {
    id: 'operations',
    label: 'Manage',
    items: PRIMARY.filter((item) =>
      [
        '/admin/streams',
        '/admin/storage',
        '/admin/files',
        '/admin/financial',
        '/admin/vendors',
        '/admin/i18n',
        '/admin/tahti-selects',
      ].includes(item.to),
    ),
  },
] as const;

export const ADMIN_NAV_TOUR_STEPS: TourStep[] = PRIMARY.map(
  (item): TourStep => ({
    id: `nav-item-${item.to}`,
    label: item.label,
    description: item.description,
  }),
);

function isActive(current: string | undefined, to: string) {
  return to === '/admin' ? current === to : matchesSectionRoute(current, [to]);
}

/** Grows page-by-page alongside the admin port — see UI-REDESIGN-WORKLOG.md. */
export function AdminNav({
  current,
  splitLayout = true,
  moderationPendingCount,
}: {
  current?: string;
  splitLayout?: boolean;
  moderationPendingCount?: number;
}) {
  const navigate = useNavigate();
  const routeSection = ADMIN_SECTIONS.find((section) =>
    section.items.some((item) => isActive(current, item.to)),
  );
  const [selectedSection, setSelectedSection] = useState(
    routeSection?.id ?? ADMIN_SECTIONS[0].id,
  );

  useEffect(() => {
    if (routeSection) {
      setSelectedSection(routeSection.id);
    }
  }, [routeSection]);

  const section =
    ADMIN_SECTIONS.find((item) => item.id === selectedSection) ??
    ADMIN_SECTIONS[0];

  const tabs = (
    <div
      aria-label="Admin sections"
      className="border-border flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg border p-1"
      role="tablist"
      data-admin-section-tabs
    >
      {ADMIN_SECTIONS.map((item) => {
        const active = item.id === selectedSection;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
            }`}
            onClick={() => {
              setSelectedSection(item.id);
              const firstPage = item.items[0];
              if (firstPage) {
                void navigate({ to: firstPage.to });
              }
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
  const menu = (
    <div data-admin-section-menu>
      <SectionSidebar
        aria-label={`Admin ${section.label}`}
        items={section.items.map((link) => ({
          id: link.to,
          label:
            link.to === '/admin/moderation' && moderationPendingCount != null
              ? `${link.label} (${moderationPendingCount})`
              : link.label,
          icon: link.icon,
          to: link.to,
          active: isActive(current, link.to),
        }))}
      />
    </div>
  );

  return splitLayout ? (
    <>
      {tabs}
      {menu}
    </>
  ) : (
    <div className="flex flex-col gap-3">
      {tabs}
      {menu}
    </div>
  );
}
