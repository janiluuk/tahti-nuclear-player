import type { Meta, StoryObj } from '@storybook/react-vite';

import { ViewShell } from '@tahti-player/ui';

const meta: Meta<typeof ViewShell> = {
  title: 'Components/ViewShell',
  component: ViewShell,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The standard full-height, scrollable page frame most top-level views mount into — an optional title/subtitle, then a scrollable content area filling the rest of the viewport.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Meta<typeof ViewShell>>;

export const Default: Story = {
  render: () => (
    <div className="h-[480px]">
      <ViewShell title="Library" subtitle="Everything you've saved">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="border-border w-full border-b py-3 text-sm">
            Row {i + 1}
          </div>
        ))}
      </ViewShell>
    </div>
  ),
};
