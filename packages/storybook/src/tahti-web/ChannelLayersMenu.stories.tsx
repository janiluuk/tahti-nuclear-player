import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChannelLayersMenu } from '@tahti-web/components/ChannelLayersMenu';
import {
  defaultChannelPageLayout,
  moveItem,
  setItemVisible,
  type ChannelLayoutPresetId,
  type ChannelPageItem,
  type ChannelPageItemType,
} from '@tahti-web/lib/channelPageLayout';
import { useState } from 'react';

const meta: Meta<typeof ChannelLayersMenu> = {
  title: 'Tahti/Channel/Designer/LayersMenu',
  component: ChannelLayersMenu,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive: full select/reorder/hide/preset wiring against local state,
 * same shape a real page-layout editor would pass in. */
export const Interactive: Story = {
  render: () => {
    const [items, setItems] = useState<ChannelPageItem[]>(
      defaultChannelPageLayout(),
    );
    const [selectedId, setSelectedId] = useState<string | null>('hero');
    const [activePresetId, setActivePresetId] =
      useState<ChannelLayoutPresetId | null>(null);

    return (
      <div className="h-[32rem]">
        <ChannelLayersMenu
          items={items}
          selectedId={selectedId}
          activePresetId={activePresetId}
          onSelect={setSelectedId}
          onToggleVisible={(id) =>
            setItems((current) => {
              const row = current.find((i) => i.id === id);
              return setItemVisible(current, id, !row?.visible);
            })
          }
          onRemove={(id) =>
            setItems((current) => current.filter((i) => i.id !== id))
          }
          onAdd={(type: ChannelPageItemType) =>
            setItems((current) => [
              ...current,
              { id: `${type}-${Date.now()}`, type, visible: true },
            ])
          }
          onReorder={(fromId, toId) =>
            setItems((current) => moveItem(current, fromId, toId))
          }
          onApplyPreset={(id) => setActivePresetId(id)}
        />
      </div>
    );
  },
};

export const LookPanel: Story = {
  name: 'Look panel (lookSlot content)',
  render: () => (
    <div className="h-[32rem]">
      <ChannelLayersMenu
        items={defaultChannelPageLayout()}
        selectedId={null}
        activePresetId="tahti"
        onSelect={() => {}}
        onToggleVisible={() => {}}
        onRemove={() => {}}
        onAdd={() => {}}
        onReorder={() => {}}
        onApplyPreset={() => {}}
        lookSlot={
          <p className="text-foreground-secondary text-xs">
            The channel-design "Look" controls (from ChannelDesigner
            lookOnly=true) dock into this panel — see the
            ChannelDesigner/Look-only story.
          </p>
        }
      />
    </div>
  ),
};
