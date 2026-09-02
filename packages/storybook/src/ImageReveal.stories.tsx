import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImageReveal } from '@tahti-player/ui';

const SAMPLE_IMAGE = 'https://i.imgur.com/4euOws2.jpg';

const meta: Meta<typeof ImageReveal> = {
  title: 'Components/ImageReveal',
  component: ImageReveal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Meta<typeof ImageReveal>>;

export const Default: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'Cover art',
    className: 'size-48 rounded-lg',
  },
};

export const WithPlaceholder: Story = {
  args: {
    src: undefined,
    alt: 'Cover art',
    className: 'bg-background-secondary size-48 rounded-lg',
    placeholder: (
      <span className="text-foreground-secondary text-xs">No artwork</span>
    ),
  },
};
