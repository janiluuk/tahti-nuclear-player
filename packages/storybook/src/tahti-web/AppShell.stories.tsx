import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { AuthUser } from '@tahti-web/api/types';
import { AppShell } from '@tahti-web/components/AppShell';
import { useAuthStore } from '@tahti-web/stores/authStore';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';

import { MOCK_USERS } from './_lib/decorators';

const FakePage = () => (
  <div className="flex flex-col gap-4">
    <h1 className="font-display text-2xl font-bold tracking-tight">
      Storybook page content
    </h1>
    <p className="text-foreground-secondary max-w-prose text-sm">
      This is stand-in route content rendered through AppShell&apos;s real
      {' <Outlet/> '}
      (via RouteTransition) — the sidebar, top nav, and player chrome around it
      are the genuine app shell, not a mock.
    </p>
  </div>
);

// AppShell redirects a signed-in user straight to `/onboarding` on first
// sign-in of the session (see hasSeenOnboarding in views/OnboardingView),
// which our minimal route tree below doesn't have a route for — pre-seed
// the "already onboarded" flag for the mock user so the shell renders its
// normal content instead of hitting an unmatched route.
function markOnboarded(userId: string) {
  try {
    localStorage.setItem(`tahti-web-onboarded:${userId}`, '1');
  } catch {
    // ignore — best-effort for the storybook preview only
  }
}

/**
 * AppShell renders its page body through the router's `<Outlet/>` (inside
 * `RouteTransition`), not a `children` prop, so the shared `withTahtiRouter`
 * decorator (which puts the story's own output at the root route) doesn't
 * fit here. This builds its own small two-level route tree instead: the
 * root route's component is AppShell itself, and a child index route
 * supplies fake page content for AppShell's `<Outlet/>` to render.
 *
 * Also seeds `useAuthStore` directly (rather than composing with the
 * separate `withMockAuth` decorator) so ordering between decorators can't
 * accidentally skip it — AppShell reads the auth store on first render for
 * sidebar items and the onboarding redirect.
 */
function withAppShellRouter(user: AuthUser | null, path = '/'): Decorator {
  return () => {
    useAuthStore.setState({ user, hydrated: true, loading: false });
    if (user) {
      markOnboarded(user.id);
    }

    const rootRoute = createRootRoute({ component: () => <AppShell /> });
    const routeTree = rootRoute.addChildren([
      createRoute({
        getParentRoute: () => rootRoute,
        path,
        component: FakePage,
      }),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [path] }),
    });
    return <RouterProvider router={router} />;
  };
}

const meta: Meta<typeof AppShell> = {
  title: 'Tahti/Chrome/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [withAppShellRouter(MOCK_USERS.board)],
};

export const SignedOut: Story = {
  decorators: [withAppShellRouter(null)],
};

export const ArtistView: Story = {
  decorators: [withAppShellRouter(MOCK_USERS.artist)],
};
