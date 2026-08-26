import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmbedButton } from '@tahti-web/components/EmbedButton';

const meta: Meta<typeof EmbedButton> = {
  title: 'Tahti/Media/EmbedButton',
  component: EmbedButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Channel: Story = {
  args: {
    target: { kind: 'channel', slug: 'northern-lights' },
  },
};

export const Release: Story = {
  args: {
    target: { kind: 'release', id: 'release-1' },
  },
};

export const Collection: Story = {
  args: {
    target: { kind: 'collection', slug: 'favorites' },
    label: 'Embed playlist',
  },
};
