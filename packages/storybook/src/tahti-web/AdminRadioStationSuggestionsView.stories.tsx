import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminRadioStationSuggestionsView } from '@tahti-web/views/admin/AdminRadioStationSuggestionsView';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof AdminRadioStationSuggestionsView> = {
  title: 'Tahti/Admin/AdminRadioStationSuggestionsView',
  component: AdminRadioStationSuggestionsView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    withTahtiRouter('/admin/radio-station-suggestions'),
    withMockAuth(),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <AdminRadioStationSuggestionsView />
    </div>
  ),
};
