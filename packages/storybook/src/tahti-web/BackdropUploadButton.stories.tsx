import type { Meta, StoryObj } from '@storybook/react-vite';
import { BackdropUploadButton } from '@tahti-web/components/BackdropUploadButton';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof BackdropUploadButton> = {
  title: 'Tahti/Media/BackdropUploadButton',
  component: BackdropUploadButton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    label: 'Backdrop',
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: null },
};

/** Hover the backdrop to reveal the corner delete (X) badge. */
export const Set: Story = {
  args: { value: 'https://picsum.photos/seed/backdrop-wide/900/300' },
};

export const PreviewModalOpen: Story = {
  args: { value: 'https://picsum.photos/seed/backdrop-wide/900/300' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /preview/i }));
  },
};

export const ConfirmDelete: Story = {
  args: { value: 'https://picsum.photos/seed/backdrop-wide/900/300' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /preview/i }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: 'Delete' }));
  },
};
