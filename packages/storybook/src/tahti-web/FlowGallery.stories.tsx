import type { Meta, StoryObj } from '@storybook/react-vite';
import { FlowGallery } from '@tahti-web/components/FlowGallery';

const meta: Meta<typeof FlowGallery> = {
  title: 'Tahti/Studio/FlowGallery',
  component: FlowGallery,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Static Mermaid diagram content (FLOW_DIAGRAMS/FLOW_PACKS) plus a
// localStorage-backed comment form (MapCommentForm) — no props, no API.
export const Default: Story = {
  render: () => (
    <div className="p-6">
      <FlowGallery />
    </div>
  ),
};
