import type { Meta, StoryObj } from '@storybook/react-vite';
import { PortInventoryPanel } from '@tahti-web/components/PortInventoryPanel';

const meta: Meta<typeof PortInventoryPanel> = {
  title: 'Tahti/Misc/PortInventoryPanel',
  component: PortInventoryPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
