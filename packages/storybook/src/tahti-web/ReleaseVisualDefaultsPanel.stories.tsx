import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReleaseVisualDefaultsPanel } from '@tahti-web/views/settings/SettingsPanels';

const meta: Meta<typeof ReleaseVisualDefaultsPanel> = {
  title: 'Tahti/Settings/ReleaseVisualDefaultsPanel',
  component: ReleaseVisualDefaultsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Artist → Releases settings for the visualizer assigned to newly created releases.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ParticleFieldByDefault: Story = {};
