import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_COLOR_SCHEME } from '@tahti-web/api/channel-design';
import { PageBackgroundField } from '@tahti-web/components/channel-designer/PageBackgroundField';
import { useState } from 'react';

const meta: Meta<typeof PageBackgroundField> = {
  title: 'Tahti/Channel/Designer/PageBackgroundField',
  component: PageBackgroundField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [scheme, setScheme] = useState({ ...DEFAULT_COLOR_SCHEME });
    return (
      <div className="max-w-sm">
        <PageBackgroundField
          scheme={scheme}
          backgroundScheme={{}}
          useBackgroundGradient={false}
          onChange={(bg) => setScheme((current) => ({ ...current, bg }))}
        />
      </div>
    );
  },
};

export const SeparateBackgroundPalette: Story = {
  name: 'Uses separate background palette bg',
  render: () => {
    const [backgroundScheme, setBackgroundScheme] = useState({
      bg: '#1a1030',
    });
    return (
      <div className="max-w-sm">
        <PageBackgroundField
          scheme={DEFAULT_COLOR_SCHEME}
          backgroundScheme={backgroundScheme}
          useBackgroundGradient
          onChange={(bg) =>
            setBackgroundScheme((current) => ({ ...current, bg }))
          }
        />
      </div>
    );
  },
};
