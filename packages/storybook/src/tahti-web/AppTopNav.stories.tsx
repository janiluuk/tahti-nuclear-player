import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppTopNav } from '@tahti-web/components/AppTopNav';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AppTopNav> = {
  title: 'Tahti/Chrome/AppTopNav',
  component: AppTopNav,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
};

export const SignedInListener: Story = {
  decorators: [withMockAuth(MOCK_USERS.listener)],
};

export const SignedInArtist: Story = {
  decorators: [withMockAuth(MOCK_USERS.artist)],
  args: {
    showMenuButton: true,
    onOpenMenu: () => {},
  },
};

export const SignedInArtistWithMenu: Story = {
  decorators: [withMockAuth(MOCK_USERS.artist)],
  args: {
    showMenuButton: true,
    onOpenMenu: () => {},
  },
};

export const SignedOutWithMenu: Story = {
  decorators: [withMockAuth(null)],
  args: {
    showMenuButton: true,
    onOpenMenu: () => {},
  },
};

export const MobileStableChrome: Story = {
  decorators: [withMockAuth(MOCK_USERS.artist)],
  args: {
    showMenuButton: true,
    onOpenMenu: () => {},
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
