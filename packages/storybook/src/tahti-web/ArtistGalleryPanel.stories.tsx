import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArtistGalleryAddIcon,
  ArtistGalleryPanel,
} from '@tahti-web/components/ArtistGalleryPanel';

const mockImages = [
  {
    id: 'img-1',
    imageUrl: 'https://picsum.photos/seed/gallery1/500',
    title: 'Studio session',
  },
  {
    id: 'img-2',
    imageUrl: 'https://picsum.photos/seed/gallery2/500',
    title: 'Live at Tavastia',
  },
  {
    id: 'img-3',
    imageUrl: 'https://picsum.photos/seed/gallery3/500',
    title: null,
  },
  {
    id: 'img-4',
    imageUrl: 'https://picsum.photos/seed/gallery4/500',
    title: 'Backstage',
  },
  {
    id: 'img-5',
    imageUrl: 'https://picsum.photos/seed/gallery5/500',
    title: 'Cover shoot',
  },
];

const meta: Meta<typeof ArtistGalleryPanel> = {
  title: 'Tahti/Studio/ArtistGalleryPanel',
  component: ArtistGalleryPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnerView: Story = {
  args: {
    images: mockImages,
    isOwner: true,
    onChange: () => {},
  },
};

export const VisitorView: Story = {
  args: {
    images: mockImages,
    isOwner: false,
    onChange: () => {},
  },
};

export const Empty: Story = {
  args: {
    images: [],
    isOwner: true,
    onChange: () => {},
  },
};

export const AddIcon: StoryObj = {
  name: 'ArtistGalleryAddIcon',
  render: () => <ArtistGalleryAddIcon onCreated={() => {}} />,
};
