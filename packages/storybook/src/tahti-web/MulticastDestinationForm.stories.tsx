import type { Meta, StoryObj } from '@storybook/react-vite';
import { MulticastDestinationForm } from '@tahti-web/components/MulticastDestinationForm';
import type { MulticastProviderId } from '@tahti-web/plugins/multicast';
import { useState } from 'react';

const meta: Meta<typeof MulticastDestinationForm> = {
  title: 'Tahti/Broadcast/MulticastDestinationForm',
  component: MulticastDestinationForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulForm({ provider }: { provider: MulticastProviderId }) {
  const [selectedProvider, setSelectedProvider] = useState(provider);
  const [label, setLabel] = useState('My live mirror');
  const [streamKey, setStreamKey] = useState('platform-stream-key');
  const [rtmpUrl, setRtmpUrl] = useState('');

  return (
    <MulticastDestinationForm
      provider={selectedProvider}
      label={label}
      streamKey={streamKey}
      rtmpUrl={rtmpUrl}
      onProviderChange={setSelectedProvider}
      onLabelChange={setLabel}
      onStreamKeyChange={setStreamKey}
      onRtmpUrlChange={setRtmpUrl}
      onSubmit={() => undefined}
    />
  );
}

export const Twitch: Story = {
  render: () => <StatefulForm provider="TWITCH" />,
};

export const YouTube: Story = {
  render: () => <StatefulForm provider="YOUTUBE" />,
};

export const CustomRtmp: Story = {
  render: () => <StatefulForm provider="CUSTOM" />,
};
