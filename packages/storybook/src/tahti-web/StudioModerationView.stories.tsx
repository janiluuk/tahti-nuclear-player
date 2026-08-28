import type { Meta, StoryObj } from '@storybook/react-vite';
import { StudioModerationView } from '@tahti-web/views/studio/StudioModerationView';

import { MOCK_USERS, withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof StudioModerationView> = {
  title: 'Tahti/Studio/StudioModerationView',
  component: StudioModerationView,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    withTahtiRouter('/studio/moderation'),
    withMockAuth(MOCK_USERS.artist),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ModerationWorkspace: Story = {};
