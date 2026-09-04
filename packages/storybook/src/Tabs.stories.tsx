import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BellIcon,
  HeartIcon,
  ListMusicIcon,
  MessageCircleIcon,
  MusicIcon,
  SearchIcon,
  UsersIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Box, Card, CardGrid, Loader, TabLabel, Tabs } from '@tahti-player/ui';

const meta = {
  title: 'Layout/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Headless UI tab strip. Prefer this for every in-app tab row. Use `icon` / `count` on declarative items, or `TabLabel` in composition mode. Settings modal keeps `SettingsPanel` nav (not Tabs).',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  {
    id: 'artists',
    label: 'Artists',
    content: (
      <div className="text-foreground">
        <CardGrid>
          {[
            'Frank Zappa',
            'Ozzy Osbourne',
            'David Bowie',
            'Kurt Cobain',
            'John Lennon',
          ].map((item) => (
            <Card
              key={item}
              title={item}
              src={`https://picsum.photos/seed/${item}/300`}
            />
          ))}
        </CardGrid>
      </div>
    ),
  },
  {
    id: 'tracks',
    label: 'Tracks',
    content: (
      <div className="text-foreground">
        <Loader /> Still loading!
      </div>
    ),
  },
  {
    id: 'about',
    label: 'About',
    content: (
      <div className="text-foreground">
        <Box>Section in a box.</Box>
      </div>
    ),
  },
];

export const Basic: Story = {
  args: {
    items: ITEMS,
  },
};

export const WithIcons: Story = {
  name: 'With icons',
  args: {
    items: [
      {
        id: 'artists',
        label: 'Artists',
        icon: <UsersIcon size={14} />,
        content: ITEMS[0]!.content,
      },
      {
        id: 'tracks',
        label: 'Tracks',
        icon: <MusicIcon size={14} />,
        content: ITEMS[1]!.content,
      },
      {
        id: 'favorites',
        label: 'Favorites',
        icon: <HeartIcon size={14} />,
        content: <div className="text-foreground">Saved tracks.</div>,
      },
    ],
  },
};

export const WithCountPills: Story = {
  name: 'With count pills',
  args: {
    items: [
      {
        id: 'installed',
        label: 'Installed',
        count: 3,
        content: (
          <div className="text-foreground">Three add-ons installed.</div>
        ),
      },
      {
        id: 'available',
        label: 'Available',
        count: 12,
        content: (
          <div className="text-foreground">
            Twelve add-ons ready to install.
          </div>
        ),
      },
      {
        id: 'search',
        label: 'Search',
        icon: <SearchIcon size={14} />,
        count: 0,
        content: <div className="text-foreground">No hits yet.</div>,
      },
    ],
  },
};

export const WithIconsAndCountPills: Story = {
  name: 'Icons + count pills',
  render: () => {
    const [index, setIndex] = useState(1);
    return (
      <div style={{ width: 480 }}>
        <Tabs.Root selectedIndex={index} onChange={setIndex}>
          <Tabs.List aria-label="Inbox">
            <Tabs.Tab>
              <TabLabel icon={<MessageCircleIcon size={14} />}>Chat</TabLabel>
            </Tabs.Tab>
            <Tabs.Tab>
              <TabLabel icon={<BellIcon size={14} />} count={4}>
                Notifications
              </TabLabel>
            </Tabs.Tab>
            <Tabs.Tab>
              <TabLabel icon={<ListMusicIcon size={14} />} count={7}>
                Queue
              </TabLabel>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panels>
            <Tabs.Panel>
              <div className="text-foreground mt-3 text-sm">Chat panel</div>
            </Tabs.Panel>
            <Tabs.Panel>
              <div className="text-foreground mt-3 text-sm">
                Four unread notifications
              </div>
            </Tabs.Panel>
            <Tabs.Panel>
              <div className="text-foreground mt-3 text-sm">
                Seven tracks in queue
              </div>
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs.Root>
      </div>
    );
  },
};

export const VerticalIconOnly: Story = {
  name: 'Vertical icon-only',
  render: () => {
    const [index, setIndex] = useState(0);
    return (
      <div style={{ height: 220 }}>
        <Tabs.Root
          vertical
          selectedIndex={index}
          onChange={setIndex}
          listClassName="flex-col items-center gap-2"
          tabClassName="relative size-9 shrink-0 rounded-md p-0 data-[selected]:bg-primary/15 data-[selected]:text-primary"
        >
          <Tabs.List aria-label="Rail" className="w-auto flex-col">
            <Tabs.Tab aria-label="Chat" title="Chat">
              <TabLabel icon={<MessageCircleIcon size={18} />}>
                <span className="sr-only">Chat</span>
              </TabLabel>
            </Tabs.Tab>
            <Tabs.Tab aria-label="Notifications" title="Notifications">
              <TabLabel icon={<BellIcon size={18} />} count={4}>
                <span className="sr-only">Notifications</span>
              </TabLabel>
            </Tabs.Tab>
            <Tabs.Tab aria-label="Queue" title="Queue">
              <TabLabel icon={<ListMusicIcon size={18} />} count={7}>
                <span className="sr-only">Queue</span>
              </TabLabel>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
      </div>
    );
  },
};

export const WithCustomClasses: Story = {
  args: {
    items: ITEMS,
    listClassName: 'border-b-(length:--border-width) border-border pb-1',
    tabClassName: 'rounded-t',
    panelsClassName: 'mt-4',
  },
};

export const Controlled: Story = {
  render: () => {
    const [index, setIndex] = useState(1);
    return (
      <div style={{ width: 480 }}>
        <Tabs items={ITEMS} selectedIndex={index} onChange={setIndex} />
        <div className="text-foreground mt-2 text-sm">
          Selected index: {index}
        </div>
      </div>
    );
  },
};

export const ManualActivation: Story = {
  args: {
    items: ITEMS,
    manual: true,
  },
};

export const Composition: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Tabs.Root>
        <Tabs.List>
          <Tabs.Tab>First</Tabs.Tab>
          <Tabs.Tab>Second</Tabs.Tab>
          <Tabs.Tab disabled>Disabled</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            <div className="text-foreground">First panel content</div>
          </Tabs.Panel>
          <Tabs.Panel>
            <div className="text-foreground">Second panel content</div>
          </Tabs.Panel>
          <Tabs.Panel>
            <div className="text-foreground">Disabled panel content</div>
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs.Root>
    </div>
  ),
};
