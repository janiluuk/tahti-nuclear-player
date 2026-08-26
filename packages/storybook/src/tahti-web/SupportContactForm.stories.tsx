import type { Meta, StoryObj } from '@storybook/react-vite';
import { SupportContactForm } from '@tahti-web/components/SupportContactForm';

import { MOCK_USERS, withMockAuth } from './_lib/decorators';

const meta: Meta<typeof SupportContactForm> = {
  title: 'Tahti/Misc/SupportContactForm',
  component: SupportContactForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Signed-in: email comes from the account, so the "Your email" field is hidden. */
export const SignedIn: Story = {
  decorators: [withMockAuth(MOCK_USERS.listener)],
};

/** Signed out: an extra "Your email" field is required before sending. */
export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
};
