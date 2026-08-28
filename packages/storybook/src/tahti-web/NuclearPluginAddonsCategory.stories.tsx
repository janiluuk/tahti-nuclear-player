import type { Meta, StoryObj } from '@storybook/react-vite';
import { NuclearPluginAddonsCategory } from '@tahti-web/components/NuclearPluginAddonsCategory';

const meta: Meta<typeof NuclearPluginAddonsCategory> = {
  title: 'Tahti/Add-ons/Nuclear plugin catalog',
  component: NuclearPluginAddonsCategory,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Nuclear registry integrations grouped by type. Configuration is stored locally until a matching Tahti API contract exists.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};
