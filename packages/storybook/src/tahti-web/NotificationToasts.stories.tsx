import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Button,
  showNotificationToast,
  toast,
  Toaster,
} from '@tahti-player/ui';

/**
 * Inbox toasts live on the Nuclear `Toaster`. Sticky notices use
 * `showNotificationToast({ sticky: true })` so they stay until Acknowledge.
 * Closing the toast only hides it; the notifications list keeps the item.
 */
const meta: Meta = {
  title: 'Tahti/Misc/NotificationToasts',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StickyAndOrdinary: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Toaster richColors />
      <p className="text-foreground-secondary max-w-sm text-sm">
        Ordinary toasts fade. Sticky toasts stay until you acknowledge them,
        matching the notifications list.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() =>
            showNotificationToast('New fan', {
              description:
                'Midnight Cartography started following your channel.',
            })
          }
        >
          Ordinary
        </Button>
        <Button
          onClick={() =>
            showNotificationToast('Theme is in review', {
              id: 'story-inbox-sticky',
              description: 'An admin will approve or reject it soon.',
              sticky: true,
              actionLabel: 'Acknowledge',
              onAction: () => toast.dismiss('story-inbox-sticky'),
            })
          }
        >
          Sticky
        </Button>
      </div>
    </div>
  ),
};
