import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelElementEditor } from '@tahti-web/components/ChannelElementEditor';
import type { ChannelLookElementId } from '@tahti-web/lib/channelLookElements';
import { useState } from 'react';

const meta: Meta<typeof ChannelElementEditor> = {
  title: 'Tahti/Channel/ChannelElementEditor',
  component: ChannelElementEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function EditorDemo({
  initialId = 'header',
}: {
  initialId?: ChannelLookElementId;
}) {
  const [selectedId, setSelectedId] = useState<ChannelLookElementId>(initialId);
  const [hidden, setHidden] = useState<
    Partial<Record<ChannelLookElementId, boolean>>
  >({});
  return (
    <div className="max-w-sm">
      <ChannelElementEditor
        selectedId={selectedId}
        onSelect={setSelectedId}
        onToggleDisabled={(id) =>
          setHidden((current) => ({ ...current, [id]: !current[id] }))
        }
        items={[
          {
            id: 'header',
            content: <p className="text-sm">Header backdrop and identity.</p>,
          },
          {
            id: 'player',
            disabled: hidden.player,
            content: (
              <p className="text-sm">Player gradient, visualizer, overlay.</p>
            ),
          },
          {
            id: 'background',
            content: <p className="text-sm">Page background colors.</p>,
          },
          {
            id: 'actions',
            disabled: hidden.actions,
            content: <p className="text-sm">Tune-in actions.</p>,
          },
          {
            id: 'archive',
            disabled: hidden.archive,
            content: <p className="text-sm">Published tracks.</p>,
          },
          {
            id: 'about',
            disabled: hidden.about,
            content: <p className="text-sm">About the artist.</p>,
          },
          {
            id: 'links',
            disabled: hidden.links,
            content: <p className="text-sm">Outbound links.</p>,
          },
          {
            id: 'subscribe',
            disabled: hidden.subscribe,
            content: <p className="text-sm">Fan subscribe CTA.</p>,
          },
          {
            id: 'stats',
            disabled: hidden.stats,
            content: <p className="text-sm">Follower stats.</p>,
          },
          {
            id: 'events',
            disabled: hidden.events,
            content: <p className="text-sm">Live shows.</p>,
          },
        ]}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <EditorDemo />,
};

export const PlayerSelected: Story = {
  render: () => <EditorDemo initialId="player" />,
};
