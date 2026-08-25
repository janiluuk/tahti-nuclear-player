import type { TourStep } from '../lib/pageTour';
import { InPageNav } from './InPageNav';

const PRIMARY = [
  {
    to: '/admin',
    label: 'Dashboard',
    description: 'Platform-wide overview — activity, health, and shortcuts.',
  },
  {
    to: '/admin/activity',
    label: 'Activity',
    description:
      'Live system events — logins, uploads, releases, likes, follows, subscriptions.',
  },
  {
    to: '/admin/logs',
    label: 'Logs',
    description:
      'Live container logs from every service in the production stack.',
  },
  {
    to: '/admin/moderation',
    label: 'Moderation',
    description:
      'Support, beta applications, radio submissions, Selects, content reports, and feature requests — one tabbed queue.',
  },
  {
    to: '/admin/users',
    label: 'Users',
    description: 'Search accounts and edit role, membership, and suspension.',
  },
  {
    to: '/admin/radio',
    label: 'Radio',
    description:
      'Tahti Radio and Tahti Selects rotation, live from the station.',
  },
  {
    to: '/admin/radio-station-suggestions',
    label: 'Radio stations',
    description:
      'Review listener-suggested internet radio stations for the Widgets store.',
  },
  {
    to: '/admin/news',
    label: 'News',
    description: 'Publish platform-wide news posts.',
  },
  {
    to: '/admin/streams',
    label: 'Streams',
    description: 'Monitor live ingest and stream health across channels.',
  },
  {
    to: '/admin/top-lists',
    label: 'Top lists',
    description: 'Editorial top-track and top-artist lists.',
  },
  {
    to: '/admin/announcements',
    label: 'Announcements',
    description: 'Site-wide banners and announcement messages.',
  },
  {
    to: '/admin/storage',
    label: 'Storage',
    description:
      'Disk/object storage space, quotas, and every uploaded file across the platform.',
  },
  {
    to: '/admin/financial',
    label: 'Financial',
    description: 'Membership revenue, payouts, and financial records.',
  },
  {
    to: '/admin/governance',
    label: 'Governance',
    description: 'Member votes and cooperative governance items.',
  },
  {
    to: '/admin/grants',
    label: 'Grants',
    description: 'Artist grant program applications and awards.',
  },
  {
    to: '/admin/agm',
    label: 'AGM',
    description: 'Annual general meeting scheduling and records.',
  },
  {
    to: '/admin/vendors',
    label: 'Vendors',
    description: 'Third-party vendor and service accounts.',
  },
  {
    to: '/admin/status',
    label: 'Status',
    description: 'Platform status page content and incident history.',
  },
  {
    to: '/admin/i18n',
    label: 'Languages',
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
    <InPageNav
      aria-label="Admin"
      items={PRIMARY.map((link) => ({
        id: link.to,
        label: link.label,
        to: link.to,
        active: isActive(current, link.to),
      }))}
    />
  );
}
