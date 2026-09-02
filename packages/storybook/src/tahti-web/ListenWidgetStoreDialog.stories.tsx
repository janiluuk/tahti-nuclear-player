import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListenWidgetStoreDialog } from '@tahti-web/components/ListenWidgetStoreDialog';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof ListenWidgetStoreDialog> = {
  title: 'Tahti/Widgets/ListenWidgetStoreDialog',
  component: ListenWidgetStoreDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Listen header control that opens the add-widget picker: every Listen store add-on, then discovery widgets.',
      },
    },
  },
  decorators: [withTahtiRouter('/'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
