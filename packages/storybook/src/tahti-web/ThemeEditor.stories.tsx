import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeEditor } from '@tahti-web/components/ThemeEditor';

const meta: Meta<typeof ThemeEditor> = {
  title: 'Tahti/Settings/ThemeEditor',
  component: ThemeEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Settings → Themes → Editor. Compact grouped tokens; click a swatch to expand Storybook Slider HSL controls. Appearance (light/dark/dynamic) lives on the Themes main page via ThemeController + Toggle — not inside this form. Missing states: empty name validation, discard draft.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
