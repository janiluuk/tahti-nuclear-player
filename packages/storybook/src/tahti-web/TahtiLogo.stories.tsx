import type { Meta, StoryObj } from '@storybook/react-vite';
import { TahtiLogo, TahtiLogoLink } from '@tahti-web/components/TahtiLogo';

import { withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof TahtiLogo> = {
  title: 'Tahti/Misc/TahtiLogo',
  component: TahtiLogo,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const MarkOnly: Story = {
  args: { markOnly: true },
};

export const Large: Story = {
  args: { className: 'text-2xl' },
};

/** `TahtiLogoLink` wraps the mark in a `<Link to="/">` — needs a router. */
export const AsHomeLink: StoryObj<typeof TahtiLogoLink> = {
  name: 'TahtiLogoLink',
  decorators: [withTahtiRouter('/')],
  render: () => <TahtiLogoLink />,
};
