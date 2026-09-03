import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ChannelTextOverlayEditor,
  type TextOverlayDraft,
} from '@tahti-web/components/ChannelTextOverlayEditor';
import { useState } from 'react';

const meta: Meta<typeof ChannelTextOverlayEditor> = {
  title: 'Tahti/Channel/ChannelTextOverlayEditor',
  component: ChannelTextOverlayEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function EditorDemo({ initial }: { initial: TextOverlayDraft }) {
  const [value, setValue] = useState<TextOverlayDraft>(initial);
  return (
    <div className="max-w-sm">
      <ChannelTextOverlayEditor value={value} onChange={setValue} />
    </div>
  );
}

export const NoEffect: Story = {
  render: () => (
    <EditorDemo initial={{ mode: 'NONE', text: '', align: 'CENTER' }} />
  ),
};

export const GradientShimmer: Story = {
  render: () => (
    <EditorDemo
      initial={{
        mode: 'GRADIENT_SHIMMER',
        text: 'New album out now — listen live',
        align: 'CENTER',
      }}
    />
  ),
};
