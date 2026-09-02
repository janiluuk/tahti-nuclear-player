import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CreatableCombobox } from '@tahti-player/ui';

const meta: Meta<typeof CreatableCombobox> = {
  title: 'Components/Combobox',
  component: CreatableCombobox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A searchable select that also lets the user type a brand-new value and add it on the fly (e.g. genre tags).',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<Meta<typeof CreatableCombobox>>;

const GENRES = ['House', 'Techno', 'Ambient', 'Drum & Bass', 'Disco'];

function Interactive() {
  const [options, setOptions] = useState(GENRES);
  const [value, setValue] = useState('');
  return (
    <div className="w-72">
      <CreatableCombobox
        label="Genre"
        description="Pick an existing genre, or type a new one."
        options={options}
        value={value}
        onValueChange={(next) => {
          setValue(next);
          if (!options.includes(next)) {
            setOptions((prev) => [...prev, next]);
          }
        }}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Interactive />,
};
