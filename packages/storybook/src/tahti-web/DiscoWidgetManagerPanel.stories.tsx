import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiscoWidgetManagerPanel } from '@tahti-web/components/disco-widgets/DiscoWidgetManagerPanel';

import { withMockAuth, withTahtiRouter } from './_lib/decorators';

const meta: Meta<typeof DiscoWidgetManagerPanel> = {
  title: 'Tahti/Widgets/DiscoWidgetManagerPanel',
  component: DiscoWidgetManagerPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Install/reorder/remove UI for disco-widgets, scoped to a listener account or an artist channel. The store list and install list both come from the live API; without a backend this renders its honest empty state rather than fake fixtures.',
      },
    },
  },
  decorators: [withTahtiRouter('/studio'), withMockAuth()],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ArtistScope: Story = {
  args: {
    scope: 'ARTIST',
    description:
      'Add-ons shown on your public channel page, alongside the audience.',
  },
};

export const ListenerScope: Story = {
  args: {
    scope: 'LISTENER',
    description: 'Add-ons shown on your Listen page.',
  },
};
