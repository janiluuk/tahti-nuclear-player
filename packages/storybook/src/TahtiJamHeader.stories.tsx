import type { Meta } from '@storybook/react-vite';

import { ConnectionStatusLabels, TahtiJam } from '@tahti-player/ui';

const connectionStatusLabels: ConnectionStatusLabels = {
  connecting: 'Connecting',
  connected: 'Connected',
  reconnecting: 'Reconnecting',
  failed: 'Disconnected',
};

const meta = {
  title: 'Remote/TahtiJam/Header',
  component: TahtiJam.Header,
  tags: ['autodocs'],
} satisfies Meta<typeof TahtiJam.Header>;

export default meta;

export const Connecting = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Header
        connectionStatus="connecting"
        connectionStatusLabels={connectionStatusLabels}
      />
    </div>
  ),
};

export const Connected = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Header
        connectionStatus="connected"
        connectionStatusLabels={connectionStatusLabels}
      />
    </div>
  ),
};

export const Reconnecting = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Header
        connectionStatus="reconnecting"
        connectionStatusLabels={connectionStatusLabels}
      />
    </div>
  ),
};

export const Failed = {
  render: () => (
    <div className="bg-background">
      <TahtiJam.Header
        connectionStatus="failed"
        connectionStatusLabels={connectionStatusLabels}
      />
    </div>
  ),
};
