import type { Meta, StoryObj } from '@storybook/react-vite';

import { NewsWidget } from '@tahti-player/ui';

const meta = {
  title: 'Components/NewsWidget',
  component: NewsWidget,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Widescreen sibling of CardsRow for articles/news — thumbnail, header, and teaser. Used by the Listen News add-on: configure an RSS/Atom URL and optional thumbnail, then the slider appears on Listen and/or Discover.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NewsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = {
  nothingFound: 'No articles right now — check back soon.',
};

const items = [
  {
    id: '1',
    title: 'Tahti ry opens applications for the winter grant round',
    teaser:
      'The cooperative’s member-voted grant pool is open again — here’s how the engagement-unit split works and how to apply before the deadline.',
    imageUrl: 'https://picsum.photos/640/360?random=11',
  },
  {
    id: '2',
    title: 'Behind the scenes: rebuilding the broadcast pipeline',
    teaser:
      'A look at the infrastructure work that cut stream startup latency in half, and what it means for artists going live.',
    imageUrl: 'https://picsum.photos/640/360?random=12',
  },
  {
    id: '3',
    title: 'Artist spotlight: three new collectives joining the roster',
    teaser:
      'Meet the latest artists to join Tahti — genres, first releases, and where to catch their debut broadcasts.',
    imageUrl: 'https://picsum.photos/640/360?random=13',
  },
  {
    id: '4',
    title: 'Governance recap: this quarter’s member motions',
    teaser:
      'What passed, what didn’t, and what the board is prioritizing next — a plain-language summary of the latest AGM.',
    imageUrl: 'https://picsum.photos/640/360?random=14',
  },
];

export const Default: Story = {
  args: {
    title: 'News & articles',
    items,
    labels,
  },
};

export const WithBadge: Story = {
  args: {
    title: 'News & articles',
    badge: 'New',
    items,
    labels,
  },
};

export const WithThumbnail: Story = {
  args: {
    title: 'News & articles',
    thumbnailUrl: 'https://picsum.photos/64/64?random=31',
    items,
    labels,
  },
};

export const Empty: Story = {
  args: {
    title: 'News & articles',
    items: [],
    labels,
  },
};
