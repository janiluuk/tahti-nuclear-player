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
    to: '/admin/beta',
    label: 'Beta',
    description: 'Manage beta access and feature rollout.',
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
    to: '/admin/radio-submissions',
    label: 'Radio submissions',
    description: 'Review tracks submitted for rotation consideration.',
  },
  {
    to: '/admin/news',
    label: 'News',
    description: 'Publish platform-wide news posts.',
  },
  {
    to: '/admin/tahti-selects',
    label: 'Selects',
    description: 'Curate the Tahti Selects editorial rotation.',
  },
  {
    to: '/admin/streams',
    label: 'Streams',
    description: 'Monitor live ingest and stream health across channels.',
  },
  {
    to: '/admin/support',
    label: 'Support',
    description: 'Member and listener support requests.',
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
    description: 'Platform storage usage and quotas.',
  },
  {
    to: '/admin/files',
    label: 'Files',
    description: 'Browse uploaded files across the platform.',
  },
  {
    to: '/admin/content-reports',
    label: 'Content reports',
    description: 'User-reported tracks, chats, and profiles awaiting review.',
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
    to: '/admin/feature-requests',
    label: 'Feature requests',
    description: 'Track and triage member-submitted feature requests.',
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
