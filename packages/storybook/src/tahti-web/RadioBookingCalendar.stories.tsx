import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioBookingCalendar } from '@tahti-web/components/RadioBookingCalendar';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof RadioBookingCalendar> = {
  title: 'Tahti/Studio/RadioBookingCalendar',
  component: RadioBookingCalendar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio/shows')],
  args: {
    isOpen: true,
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Signed in with a channel — booking form + prepared-show picker render
// below the month grid, backed by fetchShowBookings/fetchShowSeries.
export const SignedInArtist: Story = {
  decorators: [withMockAuth(MOCK_USERS.artist)],
};

// No account — booking form is replaced by a sign-in prompt.
export const SignedOut: Story = {
  decorators: [withMockAuth(null)],
};
