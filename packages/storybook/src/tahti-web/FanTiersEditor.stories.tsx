import type { Meta, StoryObj } from '@storybook/react-vite';
import { FanTiersEditor } from '@tahti-web/components/FanTiersEditor';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof FanTiersEditor> = {
  title: 'Tahti/Studio/FanTiersEditor',
  component: FanTiersEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio/fans'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Self-fetches its tier list via fetchMyFanTiers (mocked fixture data) and
// manages its own "create tier" dialog state internally.
export const Default: Story = {};
