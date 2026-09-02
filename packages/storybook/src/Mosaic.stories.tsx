import type { Meta, StoryObj } from '@storybook/react-vite';

import { Mosaic } from '@tahti-player/ui';

const SAMPLE_IMAGE = 'https://i.imgur.com/4euOws2.jpg';

const meta: Meta<typeof Mosaic> = {
  title: 'Components/Mosaic',
  component: Mosaic,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Meta<typeof Mosaic>>;

export const Default: Story = {
  args: {
    urls: [SAMPLE_IMAGE, SAMPLE_IMAGE, SAMPLE_IMAGE, SAMPLE_IMAGE],
    className: 'size-40 rounded-lg overflow-hidden',
  },
};

export const FewerThanFour: Story = {
  args: {
    urls: [SAMPLE_IMAGE, SAMPLE_IMAGE],
    className: 'size-40 rounded-lg overflow-hidden',
  },
};
