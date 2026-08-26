import type { Meta, StoryObj } from '@storybook/react-vite';
import { lazy, Suspense } from 'react';

// SidebarBuildInfo reads three Vite `define`-time constants
// (__APP_VERSION__ / __COMMIT_HASH__ / __BUILD_TIME__) that tahti-web's own
// vite.config.ts injects at build time — Storybook's vite config doesn't
// define them. We stub them as real globals here, then dynamic-import the
// component (via React.lazy) so its module only evaluates after the stubs
// are in place; a plain static import would run before this file's own
// top-level code and throw a ReferenceError.
(globalThis as Record<string, unknown>).__APP_VERSION__ = '0.0.0-storybook';
(globalThis as Record<string, unknown>).__COMMIT_HASH__ = 'abcdef1';
(globalThis as Record<string, unknown>).__BUILD_TIME__ =
  new Date().toISOString();

const SidebarBuildInfo = lazy(() =>
  import('@tahti-web/components/SidebarBuildInfo').then((m) => ({
    default: m.SidebarBuildInfo,
  })),
);

const meta: Meta<typeof SidebarBuildInfo> = {
  title: 'Tahti/Misc/SidebarBuildInfo',
  component: SidebarBuildInfo,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Suspense fallback={null}>
      <SidebarBuildInfo />
    </Suspense>
  ),
};
