import { Button, Input, Select } from '@tahti-player/ui';

import {
  multicastProviders,
  type MulticastProviderId,
} from '../plugins/multicast';

type MulticastDestinationFormProps = {
  provider: MulticastProviderId;
  label: string;
  streamKey: string;
  rtmpUrl: string;
  busy?: boolean;
  onProviderChange: (provider: MulticastProviderId) => void;
  onLabelChange: (label: string) => void;
  onStreamKeyChange: (streamKey: string) => void;
  onRtmpUrlChange: (rtmpUrl: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
};

export function MulticastDestinationForm({
  provider,
  label,
  streamKey,
  rtmpUrl,
  busy = false,
  onProviderChange,
  onLabelChange,
  onStreamKeyChange,
  onRtmpUrlChange,
  onSubmit,
  submitLabel = 'Add',
}: MulticastDestinationFormProps) {
  const isCustom = provider === 'CUSTOM';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Select
        label="Provider"
        value={provider}
        onValueChange={(value) =>
          onProviderChange(value as MulticastProviderId)
        }
        options={multicastProviders.map((item) => ({
          id: item.id,
          label: item.label,
        }))}
      />
      <Input
        label="Label"
        value={label}
        onChange={(event) => onLabelChange(event.target.value)}
      />
      <Input
        label="Stream key"
        type="password"
        value={streamKey}
        onChange={(event) => onStreamKeyChange(event.target.value)}
        autoComplete="off"
      />
      {isCustom && (
        <Input
          label="RTMP address"
          value={rtmpUrl}
          onChange={(event) => onRtmpUrlChange(event.target.value)}
          placeholder="rtmp://example.com/live"
        />
      )}
      <Button
        size="sm"
        disabled={busy || !streamKey.trim() || (isCustom && !rtmpUrl.trim())}
        onClick={onSubmit}
      >
        {busy ? 'Adding…' : submitLabel}
      </Button>
    </div>
  );
}
