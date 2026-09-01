import { DownloadIcon } from 'lucide-react';

import { Button } from '@tahti-player/ui';

type Props = {
  channelName: string;
  channelSlug: string;
  server: string;
  streamKey: string;
};

function filePart(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'channel'
  );
}

export function ObsPresetButton({
  channelName,
  channelSlug,
  server,
  streamKey,
}: Props) {
  const downloadPreset = () => {
    const sceneName = `${channelName} on Tahti`;
    const preset = {
      format: 'tahti-obs-preset',
      version: 1,
      name: sceneName,
      channel: {
        name: channelName,
        slug: channelSlug,
      },
      stream: {
        service: 'Custom…',
        server,
        streamKey,
      },
      sceneCollection: {
        current_scene: sceneName,
        current_program_scene: sceneName,
        scene_order: [{ name: sceneName }],
        name: sceneName,
        sources: [],
      },
    };
    const blob = new Blob([JSON.stringify(preset, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filePart(channelSlug)}-obs-preset.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={downloadPreset}
      title="Download an OBS preset with your Tahti stream settings"
    >
      <DownloadIcon size={14} aria-hidden className="mr-1.5" />
      Download OBS preset
    </Button>
  );
}
