import type { Meta, StoryObj } from '@storybook/react-vite';
import { PluginStorePanel } from '@tahti-web/components/PluginStorePanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof PluginStorePanel> = {
  title: 'Tahti/Widgets/PluginStorePanel',
  component: PluginStorePanel,
  parameters: { layout: 'padded' },
  decorators: [withTahtiRouter('/studio'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Category is internal tab state (starts on "Themes") — click the other
// tabs in the rendered panel to browse Visualizers, Export, Import,
// Fingerprinting, Multicast, and Audio plugins categories.
export const Default: Story = {};
