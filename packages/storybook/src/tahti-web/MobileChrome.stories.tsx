import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  MobileBottomNav,
  MobileDrawer,
} from '@tahti-web/components/MobileChrome';
import { useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof MobileBottomNav> = {
  title: 'Tahti/Chrome/MobileChrome',
  component: MobileBottomNav,
  parameters: { layout: 'fullscreen' },
  decorators: [withTahtiRouter('/')],
};

export default meta;
type Story = StoryObj<typeof meta>;

// MobileBottomNav is styled `md:hidden` — it only renders visibly once the
// Storybook preview iframe itself is narrower than Tailwind's `md`
// breakpoint (768px), same as the real app. No viewport addon is
// configured for this Storybook instance, so narrow the browser window (or
// the canvas panel) below 768px to see it; at normal desktop width the nav
// mounts but is hidden by the media query, same as production.
export const BottomNavListener: Story = {
  name: 'MobileBottomNav (listener)',
  decorators: [withMockAuth(MOCK_USERS.listener)],
  render: () => (
    <div className="bg-background-secondary flex h-24 flex-col justify-end">
      <MobileBottomNav />
    </div>
  ),
};

export const BottomNavBoard: Story = {
  name: 'MobileBottomNav (board member — includes More tab)',
  decorators: [withMockAuth(MOCK_USERS.board)],
  render: () => (
    <div className="bg-background-secondary flex h-24 flex-col justify-end">
      <MobileBottomNav />
    </div>
  ),
};

// MobileDrawer's outer overlay is also `md:hidden` — same caveat as above:
// narrow the preview below 768px to see it rendered.
export const Drawer: StoryObj = {
  name: 'MobileDrawer',
  render: function DrawerStory() {
    const [open, setOpen] = useState(true);
    return (
      <div className="p-6">
        <Button size="sm" onClick={() => setOpen(true)}>
          Open drawer
        </Button>
        <MobileDrawer
          open={open}
          title="Navigate"
          onClose={() => setOpen(false)}
        >
          <p className="text-sm">Drawer content goes here.</p>
        </MobileDrawer>
      </div>
    );
  },
};

export const DrawerNoTitle: StoryObj = {
  name: 'MobileDrawer (no title — content owns its own header)',
  render: () => (
    <div className="p-6">
      <MobileDrawer open title={undefined} side="right" onClose={() => {}}>
        <p className="text-sm">
          When `title` is omitted, the header row shows only the close button —
          used when the drawer&apos;s own content (e.g. RightRailPanel) already
          renders an icon + label.
        </p>
      </MobileDrawer>
    </div>
  ),
};
