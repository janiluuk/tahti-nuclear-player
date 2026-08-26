import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MapCommentForm } from '@tahti-web/components/MapCommentForm';
import { useMapNotesStore } from '@tahti-web/stores/mapNotesStore';

/** Seeds a draft into `useMapNotesStore` before render — MapCommentForm
 * reads its current text from that store rather than taking a `value` prop. */
function withDraft(
  kind: 'case' | 'flow' | 'feature',
  targetId: string,
  text: string,
): Decorator {
  return (Story) => {
    useMapNotesStore.setState((s) => ({
      draftsByKey: { ...s.draftsByKey, [`${kind}:${targetId}`]: text },
    }));
    return <Story />;
  };
}

function withEmptyDraft(): Decorator {
  return (Story) => {
    useMapNotesStore.setState({ draftsByKey: {}, notesByCaseId: {} });
    return <Story />;
  };
}

const meta: Meta<typeof MapCommentForm> = {
  title: 'Tahti/Widgets/MapCommentForm',
  component: MapCommentForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [withEmptyDraft()],
  args: {
    kind: 'feature',
    targetId: 'listener-widgets',
    title: 'Listener widgets',
  },
};

export const WithDraft: Story = {
  decorators: [
    withDraft(
      'feature',
      'listener-widgets',
      'Should the SoundCloud embed auto-pause when radio starts playing?',
    ),
  ],
  args: {
    kind: 'feature',
    targetId: 'listener-widgets',
    title: 'Listener widgets',
  },
};

export const CustomLabelAndPlaceholder: Story = {
  decorators: [withEmptyDraft()],
  args: {
    kind: 'flow',
    targetId: 'onboarding-flow',
    pack: 'current',
    title: 'Onboarding flow',
    label: 'Reviewer notes',
    placeholder: 'What should change about this flow?',
  },
};
