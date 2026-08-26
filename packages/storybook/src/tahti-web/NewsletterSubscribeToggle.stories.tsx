import type { Meta, StoryObj } from '@storybook/react-vite';
import { NewsletterSubscribeToggle } from '@tahti-web/components/NewsletterSubscribeToggle';

import { MOCK_USERS, withMockAuth } from './_lib/decorators';

const meta: Meta<typeof NewsletterSubscribeToggle> = {
  title: 'Tahti/Misc/NewsletterSubscribeToggle',
  component: NewsletterSubscribeToggle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    artistUsername: 'northern-lights',
    artistDisplayName: 'Northern Lights',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed-in listener: a single toggle button reflecting subscribed state. */
export const SignedIn: Story = {
  decorators: [withMockAuth(MOCK_USERS.listener)],
};

/** Anonymous visitor: click "Subscribe" to reveal a double opt-in email form. */
export const Anonymous: Story = {
  decorators: [withMockAuth(null)],
};
