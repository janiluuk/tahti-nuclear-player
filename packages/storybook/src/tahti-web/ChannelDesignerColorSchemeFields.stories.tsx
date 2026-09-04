import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_COLOR_SCHEME } from '@tahti-web/api/channel-design';
import { ColorSchemeFields } from '@tahti-web/components/channel-designer/ColorSchemeFields';
import { useState } from 'react';

/**
 * Shared color pickers used by Channel Designer Backdrop / Player / page
 * background panels. Correct this primitive first — header and player
 * palettes both compose it.
 */
const meta: Meta<typeof ColorSchemeFields> = {
  title: 'Tahti/Channel/Designer/ColorSchemeFields',
  component: ColorSchemeFields,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function Interactive() {
  const [scheme, setScheme] = useState({ ...DEFAULT_COLOR_SCHEME });
  return (
    <div className="max-w-lg">
      <ColorSchemeFields scheme={scheme} onChange={setScheme} />
    </div>
  );
}

export const Default: Story = {
  render: () => <Interactive />,
};

export const PartialScheme: Story = {
  name: 'Partial (missing keys fall back to defaults)',
  render: () => {
    const [scheme, setScheme] = useState({
      accent: '#7CFFB2',
      bg: '#0B1220',
    });
    return (
      <div className="max-w-lg">
        <ColorSchemeFields scheme={scheme} onChange={setScheme} />
      </div>
    );
  },
};
