import type { Meta, StoryObj } from '@storybook/react-vite';
import { MentionTextarea } from '@tahti-web/components/MentionTextarea';
import { useState } from 'react';

const meta: Meta<typeof MentionTextarea> = {
  title: 'Tahti/Community/MentionTextarea',
  component: MentionTextarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Reusable @mention field used by TrackEditDialog (Basics → Description), Settings → Artist → Story (Short bio and Your story), and future metadata forms. Its suggestions use the authenticated Tahti user-search API from packages/tahti-web/src/api/mentions.ts.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    label: 'Description',
    value: '',
    placeholder: 'Tell listeners about this release',
    onChange: () => {},
  },
};

export const InteractiveMentionSearch: Story = {
  render: () => {
    const [value, setValue] = useState('Thanks @nor');
    return (
      <div className="max-w-2xl">
        <MentionTextarea
          label="Artist story"
          value={value}
          onChange={setValue}
          placeholder="Write a story and tag collaborators"
        />
      </div>
    );
  },
};
