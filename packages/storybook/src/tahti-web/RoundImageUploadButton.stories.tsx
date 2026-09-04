import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoundImageUploadButton } from '@tahti-web/components/RoundImageUploadButton';
import { userEvent, within } from 'storybook/test';

const meta: Meta<typeof RoundImageUploadButton> = {
  title: 'Tahti/Media/RoundImageUploadButton',
  component: RoundImageUploadButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    label: 'Avatar',
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: null },
};

/** Hover the circle to reveal the corner delete (X) badge. */
export const Set: Story = {
  args: { value: 'https://picsum.photos/seed/round-avatar/200' },
};

export const PreviewModalOpen: Story = {
  args: { value: 'https://picsum.photos/seed/round-avatar/200' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /preview/i }));
  },
};

export const ConfirmDelete: Story = {
  args: { value: 'https://picsum.photos/seed/round-avatar/200' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /preview/i }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: 'Delete' }));
  },
};
