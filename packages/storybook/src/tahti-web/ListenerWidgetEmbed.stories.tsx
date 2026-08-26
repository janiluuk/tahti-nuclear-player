import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListenerWidgetEmbed } from '@tahti-web/components/ListenerWidgetEmbed';

const meta: Meta<typeof ListenerWidgetEmbed> = {
  title: 'Tahti/Widgets/ListenerWidgetEmbed',
  component: ListenerWidgetEmbed,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SoundCloud: Story = {
  args: {
    instance: {
      id: 'widget-1',
      typeId: 'soundcloud',
      input: 'https://soundcloud.com/artist/track',
      label: 'Northern Lights — Aurora Drift',
      addedAt: new Date().toISOString(),
    },
    onRemove: () => {},
  },
};

export const YouTube: Story = {
  args: {
    instance: {
      id: 'widget-2',
      typeId: 'youtube',
      input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      label: 'Tundra Static — Live session',
      addedAt: new Date().toISOString(),
    },
    onRemove: () => {},
  },
};

export const UnrecognizedUrl: Story = {
  args: {
    instance: {
      id: 'widget-3',
      typeId: 'soundcloud',
      input: 'not-a-real-url',
      label: 'Bad paste',
      addedAt: new Date().toISOString(),
    },
    onRemove: () => {},
  },
};
