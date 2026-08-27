import {
  ActivityIcon,
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

import type { TourStep } from '../lib/pageTour';
import { SectionSidebar } from './SectionSidebar';

const PRIMARY = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: <GaugeIcon size={16} aria-hidden />,
    description: 'Platform-wide overview — activity, health, and shortcuts.',
  },
  {
    to: '/admin/activity',
    label: 'Activity',
    icon: <ActivityIcon size={16} aria-hidden />,
    description:
      'Live system events — logins, uploads, releases, likes, follows, subscriptions.',
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
    to: '/admin/radio-station-suggestions',
    label: 'Radio stations',
    icon: <RadioIcon size={16} aria-hidden />,
    description:
      'Review listener-suggested internet radio stations for the Widgets store.',
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
    label: 'Top lists',
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
] as const;

export const ADMIN_NAV_TOUR_STEPS: TourStep[] = PRIMARY.map(
  (item): TourStep => ({
    id: `nav-item-${item.to}`,
    label: item.label,
    description: item.description,
  }),
);

function isActive(current: string | undefined, to: string) {
  return (
    current === to || (to !== '/admin' && Boolean(current?.startsWith(to)))
  );
}

/** Grows page-by-page alongside the admin port — see UI-REDESIGN-WORKLOG.md. */
export function AdminNav({ current }: { current?: string }) {
  return (
    <SectionSidebar
      aria-label="Admin"
      items={PRIMARY.map((link) => ({
        id: link.to,
        label: link.label,
        icon: link.icon,
        to: link.to,
        active: isActive(current, link.to),
      }))}
    />
  );
}
