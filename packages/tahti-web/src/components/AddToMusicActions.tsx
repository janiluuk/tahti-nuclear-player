import { BlocksIcon, UploadIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { useSettingsModalStore } from '../stores/settingsModalStore';
import { UploadTrackDialog } from './UploadTrackDialog';

type Props = {
  size?: 'sm' | 'default';
  /** Center actions (e.g. empty state). */
  align?: 'start' | 'center';
  onUploaded?: () => void;
};

/** Upload + Import — entry points for adding tracks to the Music archive.
 * "Import" opens Settings → Add-ons → Import (see PluginStorePanel). */
export function AddToMusicActions({
  size = 'sm',
  align = 'start',
  onUploaded,
}: Props) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <div
        className={`flex flex-wrap gap-2 ${align === 'center' ? 'justify-center' : ''}`}
      >
        <Button
          size={size}
          onClick={() => setUploadOpen(true)}
          aria-label="Upload"
          title="Upload"
        >
          <UploadIcon size={16} aria-hidden className="mr-1.5" />
          Upload
        </Button>
        <Button
          size={size}
          variant="secondary"
          title="Import"
          onClick={() =>
            useSettingsModalStore.getState().open('plugin-store', 'import')
          }
        >
          <BlocksIcon size={16} aria-hidden className="mr-1.5" />
          Import
        </Button>
      </div>
      <UploadTrackDialog
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => onUploaded?.()}
      />
    </>
  );
}
