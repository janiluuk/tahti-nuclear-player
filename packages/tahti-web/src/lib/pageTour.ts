import { ADMIN_NAV_TOUR_STEPS } from '../components/AdminNav';
import { STUDIO_NAV_TOUR_STEPS } from '../components/StudioNav';

export type TourStep = {
  /** Matches a `data-tour-id` attribute on the element this step explains. */
  id: string;
  label: string;
  description: string;
};

const SIDEBAR_STEPS: TourStep[] = [
  {
    id: 'nav-listen',
    label: 'Listen',
    description:
      'Browse the channel directory and see who’s live right now — the front page of Tahti.',
  },
  {
    id: 'nav-radio',
    label: 'Radio',
    description:
      'Tahti Radio — the shared 24/7 member relay, plus its schedule.',
  },
  {
    id: 'nav-feed',
    label: 'Feed',
    description: 'Updates and posts from the artists and channels you follow.',
  },
  {
    id: 'nav-discover',
    label: 'Discover',
    description: 'Find new artists and channels beyond who you already follow.',
  },
  {
    id: 'nav-library',
    label: 'My Library',
    description: 'Your sounds, collections, playlists, and listening history.',
  },
  {
    id: 'nav-messages',
    label: 'Messages',
    description: 'Direct messages with artists and other listeners.',
  },
  {
    id: 'nav-studio',
    label: 'Studio',
    description:
      'Your artist workspace — broadcasting, uploads, releases, and channel tools.',
  },
  {
    id: 'nav-admin',
    label: 'Admin',
    description: 'Board tools for moderating and running the platform.',
  },
  {
    id: 'nav-more',
    label: 'More',
    description: 'Feature map and screen atlas — what exists and where.',
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    description: 'Account, artist, notification, and appearance preferences.',
  },
];

const TOPBAR_STEPS: TourStep[] = [
  {
    id: 'topbar-schedule',
    label: 'Radio schedule',
    description: 'See what’s coming up next on Tahti Radio.',
  },
  {
    id: 'topbar-golive',
    label: 'Go live',
    description: 'Jump straight to starting a broadcast on your channel.',
  },
  {
    id: 'topbar-upload',
    label: 'Upload',
    description: 'Add a new track or release to your library.',
  },
  {
    id: 'topbar-messages',
    label: 'Messages',
    description: 'Open your direct message inbox.',
  },
  {
    id: 'topbar-account',
    label: 'Account menu',
    description: 'Switch to your artist panel, open your channel, or log out.',
  },
  {
    id: 'topbar-login',
    label: 'Log in',
    description: 'Sign in to follow artists, chat, and use Studio tools.',
  },
];

function dedupeById(steps: TourStep[]): TourStep[] {
  const seen = new Set<string>();
  return steps.filter((step) => {
    if (seen.has(step.id)) {
      return false;
    }
    seen.add(step.id);
    return true;
  });
}

/**
 * Steps for the current page's guided tour (H key). Sidebar nav is always
 * explained since it's present everywhere; the top bar only makes sense to
 * call out on the homepage (elsewhere it's the same handful of icon buttons
 * repeated on every page, which would make the tour repetitive); Studio and
 * Admin panel items are explained while inside those sections.
 */
export function getPageTourSteps(pathname: string): TourStep[] {
  const steps = [...SIDEBAR_STEPS];
  if (pathname === '/') {
    steps.push(...TOPBAR_STEPS);
  }
  if (pathname.startsWith('/studio') || pathname.startsWith('/library')) {
    steps.push(...STUDIO_NAV_TOUR_STEPS);
  }
  if (pathname.startsWith('/admin')) {
    steps.push(...ADMIN_NAV_TOUR_STEPS);
  }
  return dedupeById(steps);
}
