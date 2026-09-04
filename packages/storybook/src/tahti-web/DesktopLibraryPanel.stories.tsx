import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopLibraryPanel } from '@tahti-web/components/DesktopLibraryPanel';
import { useLocalLibraryStore } from '@tahti-web/stores/localLibraryStore';
import { useEffect } from 'react';

const meta: Meta<typeof DesktopLibraryPanel> = {
  title: 'Tahti/Misc/DesktopLibraryPanel',
  component: DesktopLibraryPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        useLocalLibraryStore.getState().clear();
      }, []);
      return (
        <div className="border-border h-[28rem] w-80 border">
          <Story />
        </div>
      );
    },
  ],
};
