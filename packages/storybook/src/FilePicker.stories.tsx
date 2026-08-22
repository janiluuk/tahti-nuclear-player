import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FilePicker } from '@nuclearplayer/ui';

const meta = {
  title: 'Components/FilePicker',
  component: FilePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof FilePicker>;

export default meta;
type Story = StoryObj<typeof FilePicker>;

export const AllStates: Story = {
  render: () => {
    const [audioFiles, setAudioFiles] = useState<readonly File[]>([]);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <FilePicker
          labels={{
            title: 'Audio file',
            description: 'MP3, WAV, FLAC, or AIFF',
            browse: 'Choose audio',
          }}
          accept="audio/*"
          selectedFiles={audioFiles}
          onFiles={setAudioFiles}
        />
        <FilePicker
          labels={{
            title: 'Cover artwork',
            description: 'JPEG, PNG, or WebP',
            browse: 'Choose image',
          }}
          accept="image/*"
          selectedFiles={[new File(['cover'], 'cover.webp')]}
        />
        <FilePicker
          labels={{
            title: 'Audio file',
            description: 'Upload is in progress',
            browse: 'Choose audio',
          }}
          disabled
        />
      </div>
    );
  },
};
