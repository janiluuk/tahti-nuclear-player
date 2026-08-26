import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { AuthDialog } from '@tahti-web/components/AuthDialog';
import { useAuthModalStore } from '@tahti-web/stores/authModalStore';
import { useAuthStore } from '@tahti-web/stores/authStore';

import { withTahtiRouter } from './_lib/decorators';

/** Seeds the auth modal store to a given open/mode state before render —
 * mirrors withMockAuth's pattern, but for the modal-visibility store this
 * component reads instead of the auth store. */
function withAuthModal(mode: 'login' | 'join' = 'login'): Decorator {
  return (Story) => {
    useAuthStore.setState({
      user: null,
      hydrated: true,
      totpChallengeId: null,
    });
    useAuthModalStore.setState({ isOpen: true, mode });
    return <Story />;
  };
}

const meta: Meta<typeof AuthDialog> = {
  title: 'Tahti/Auth/AuthDialog',
  component: AuthDialog,
  parameters: { layout: 'centered' },
  decorators: [withTahtiRouter('/')],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  decorators: [withAuthModal('login')],
};

export const Join: Story = {
  decorators: [withAuthModal('join')],
};

export const TwoFactorChallenge: Story = {
  decorators: [
    ((Story) => {
      useAuthStore.setState({
        user: null,
        hydrated: true,
        totpChallengeId: 'challenge-mock-1',
      });
      useAuthModalStore.setState({ isOpen: true, mode: 'login' });
      return <Story />;
    }) as Decorator,
  ],
};
