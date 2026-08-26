import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackEditDialog } from '@tahti-web/components/TrackEditDialog';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof TrackEditDialog> = {
  title: 'Tahti/Track/TrackEditDialog',
  component: TrackEditDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    withTahtiRouter('/studio/archive/archive-item-1'),
    withMockAuth(),
  ],
  args: {
    archiveItemId: 'archive-item-1',
    onClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Self-fetches the archive item (fetchStudioArchiveItem) and radio
// submission status from the mocked API layer; the metadata tab renders
// once that resolves.
export const Default: Story = {};
