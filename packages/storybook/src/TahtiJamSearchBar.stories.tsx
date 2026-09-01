import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';

import {
  ConnectionStatusLabels,
  TahtiJam,
  TahtiJamSearchBarLabels,
} from '@tahti-player/ui';

const labels: TahtiJamSearchBarLabels = {
  placeholder: 'Search for music',
};

const connectionStatusLabels: ConnectionStatusLabels = {
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  failed: 'Disconnected',
};

const meta = {
  title: 'Remote/TahtiJam/SearchBar',
  component: TahtiJam.SearchBar,
  tags: ['autodocs'],
} satisfies Meta<typeof TahtiJam.SearchBar>;

export default meta;

export const InHeader = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="bg-background">
        <TahtiJam.Header
          connectionStatus="connected"
          connectionStatusLabels={connectionStatusLabels}
        >
          <TahtiJam.SearchBar
            value={value}
            onChange={setValue}
            labels={labels}
          />
        </TahtiJam.Header>
      </div>
    );
  },
};

export const InHeaderWithValue = {
  render: () => {
    const [value, setValue] = useState('King Gizzard');

    return (
      <div className="bg-background">
        <TahtiJam.Header
          connectionStatus="connected"
          connectionStatusLabels={connectionStatusLabels}
        >
          <TahtiJam.SearchBar
            value={value}
            onChange={setValue}
            labels={labels}
          />
        </TahtiJam.Header>
      </div>
    );
  },
};
