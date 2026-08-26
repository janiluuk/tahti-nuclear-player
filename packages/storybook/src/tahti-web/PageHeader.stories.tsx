import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageFrame, PageHeader } from '@tahti-web/components/PageHeader';

import { Badge, Button } from '@nuclearplayer/ui';

const meta: Meta<typeof PageHeader> = {
  title: 'Tahti/Page/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <PageFrame>
        <Story />
      </PageFrame>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Radio stations',
    subtitle: 'Review listener-suggested internet radio stations.',
  },
};

export const WithMetaAndActions: Story = {
  args: {
    title: 'Northern Lights',
    subtitle: 'Ambient / downtempo — live from Helsinki.',
    meta: (
      <div className="flex items-center gap-2">
        <Badge variant="pill" color="green">
          Live
        </Badge>
        <span>1.2k followers</span>
      </div>
    ),
    actions: (
      <>
        <Button size="sm" variant="secondary">
          Share
        </Button>
        <Button size="sm">Follow</Button>
      </>
    ),
  },
};
