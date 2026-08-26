import type { Meta, StoryObj } from '@storybook/react-vite';
import { StickyNotificationBanner } from '@tahti-web/components/StickyNotificationBanner';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

/**
 * Limitation: `fetchStickyNotifications` under `VITE_FORCE_MOCK` always
 * resolves `data: []` (see `packages/tahti-web/src/api/notifications.ts`),
 * so this component — which renders `null` whenever it has no items —
 * always renders empty in Storybook. There's no prop to seed it with
 * notifications; this story documents the signed-in gate (it also renders
 * null while signed out) and the wrapper it mounts into, but can't show its
 * actual banner content without a "sticky" notification present.
 */
const meta: Meta<typeof StickyNotificationBanner> = {
  title: 'Tahti/Misc/StickyNotificationBanner',
  component: StickyNotificationBanner,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  decorators: [withMockAuth(MOCK_USERS.listener)],
  render: () => (
    <div className="border-border rounded-md border border-dashed p-4">
      <p className="text-foreground-secondary mb-2 text-xs">
        Renders nothing here — the mock API always returns zero sticky
        notifications. In the real app this slot shows a dismissible
        yellow-bordered alert row per must-dismiss notification.
      </p>
      <StickyNotificationBanner />
    </div>
  ),
};

export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
};
