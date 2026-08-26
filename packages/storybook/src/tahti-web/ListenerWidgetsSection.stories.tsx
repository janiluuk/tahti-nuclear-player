import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { ListenerWidgetsSection } from '@tahti-web/components/ListenerWidgetsSection';
import { useListenerWidgetsStore } from '@tahti-web/stores/listenerWidgetsStore';

/**
 * ListenerWidgetsSection has no props — it reads entirely from
 * `useListenerWidgetsStore` (and renders nothing at all when both
 * `instances` and `enabledStationIds` are empty). This seeds that store
 * directly, the same pattern `withMockAuth` uses for the auth store.
 */
function withListenerWidgets(
  state: Partial<
    Pick<
      ReturnType<typeof useListenerWidgetsStore.getState>,
      'instances' | 'enabledStationIds'
    >
  >,
): Decorator {
  return (Story) => {
    useListenerWidgetsStore.setState({
      instances: [],
      enabledStationIds: [],
      ...state,
    });
    return <Story />;
  };
}

const meta: Meta<typeof ListenerWidgetsSection> = {
  title: 'Tahti/Widgets/ListenerWidgetsSection',
  component: ListenerWidgetsSection,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithStationsAndEmbeds: Story = {
  decorators: [
    withListenerWidgets({
      enabledStationIds: ['nrj-fi', 'radio-nova'],
      instances: [
        {
          id: 'widget-1',
          typeId: 'soundcloud',
          input: 'https://soundcloud.com/artist/track',
          label: 'Northern Lights — Aurora Drift',
          addedAt: new Date().toISOString(),
        },
      ],
    }),
  ],
};

export const StationsOnly: Story = {
  decorators: [withListenerWidgets({ enabledStationIds: ['kasari'] })],
};

// Renders nothing when the listener hasn't enabled anything — this is the
// component's actual, intentional empty behavior (returns null), so the
// canvas is expected to look blank here.
export const Empty: Story = {
  decorators: [withListenerWidgets({})],
};
