import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageUploadField } from '@tahti-web/components/ImageUploadField';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof ImageUploadField> = {
  title: 'Tahti/Media/ImageUploadField',
  component: ImageUploadField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    label: 'Cover image',
    description: 'JPEG, PNG, or WebP',
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: '' },
};

/** Hover the thumbnail to reveal the corner delete (X) badge. */
export const Set: Story = {
  args: { value: 'https://picsum.photos/seed/upload-field/200' },
};

export const PreviewModalOpen: Story = {
  args: { value: 'https://picsum.photos/seed/upload-field/200' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /preview/i }));
  },
};

export const ConfirmDelete: Story = {
  args: { value: 'https://picsum.photos/seed/upload-field/200' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /preview/i }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: 'Delete' }));
  },
};
