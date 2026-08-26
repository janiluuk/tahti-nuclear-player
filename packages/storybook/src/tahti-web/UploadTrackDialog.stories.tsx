import type { Meta, StoryObj } from '@storybook/react-vite';
import { UploadTrackDialog } from '@tahti-web/components/UploadTrackDialog';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof UploadTrackDialog> = {
  title: 'Tahti/Track/UploadTrackDialog',
  component: UploadTrackDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [withTahtiRouter('/studio/archive')],
  args: {
    isOpen: true,
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
