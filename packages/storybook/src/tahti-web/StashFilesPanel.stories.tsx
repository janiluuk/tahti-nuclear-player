import type { Meta, StoryObj } from '@storybook/react-vite';
import { StashFilesPanel } from '@tahti-web/components/StashFilesPanel';

const meta: Meta<typeof StashFilesPanel> = {
  title: 'Tahti/Studio/StashFilesPanel',
  component: StashFilesPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Fully self-fetching (fetchStashFiles / share management) — mock fixtures
// come from the VITE_FORCE_MOCK API layer, no props to configure.
export const Default: Story = {
  render: () => (
    <div className="max-w-xl">
      <StashFilesPanel />
    </div>
  ),
};
