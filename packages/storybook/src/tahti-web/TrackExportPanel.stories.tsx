import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrackExportPanel } from '@tahti-web/components/TrackExportPanel';

const meta: Meta<typeof TrackExportPanel> = {
  title: 'Tahti/Track/TrackExportPanel',
  component: TrackExportPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    archiveItemId: 'archive-item-1',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Self-fetches export status (fetchTrackExportStatus) from the mocked API
// layer — the button/"already added" state depends entirely on the fixture.
export const Default: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <TrackExportPanel {...args} />
    </div>
  ),
};
