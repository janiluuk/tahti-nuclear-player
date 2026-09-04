import type { Meta, StoryObj } from '@storybook/react-vite';

import { TahtiLogo } from '@tahti-player/ui';

const Welcome = () => (
  <div className="max-w-2xl p-8">
    <TahtiLogo className="mb-8 text-2xl" />
    <h1 className="text-foreground mb-6 text-4xl font-bold">
      Welcome to Tahti Storybook
    </h1>
    <p className="text-foreground-secondary mb-6 text-lg">
      Component development for Tahti Player and tahti-web. Develop and test UI
      components in isolation.
    </p>
  </div>
);

const meta = {
  title: 'Welcome',
  component: Welcome,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
