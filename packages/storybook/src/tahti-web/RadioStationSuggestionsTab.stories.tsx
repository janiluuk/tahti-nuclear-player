import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioStationSuggestionsTab } from '@tahti-web/views/admin/orphanPages/tabs/RadioStationSuggestionsTab';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof RadioStationSuggestionsTab> = {
  title: 'Tahti/Admin/RadioStationSuggestionsTab',
  component: RadioStationSuggestionsTab,
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
      <RadioStationSuggestionsTab />
    </div>
  ),
};
