import { Share2Icon } from 'lucide-react';
import { useState } from 'react';

import { Button, CopyButton, Dialog } from '@nuclearplayer/ui';

import { useChannelShareStore } from '../stores/channelShareStore';

export function ChannelShareButton({
  channelSlug,
  displayName,
  iconOnly = true,
}: {
  channelSlug: string;
  displayName: string;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const enabled = useChannelShareStore(
    (state) => state.enabledByChannel[channelSlug] !== false,
  );
  const url = `${window.location.origin}/channel/${channelSlug}`;
  const text = `Listen to ${displayName} on Tahti`;

  if (!enabled) {
    return null;
  }

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: displayName, text, url });
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        size={iconOnly ? 'icon-sm' : 'sm'}
        variant="secondary"
        onClick={() => void share()}
        aria-label={`Share ${displayName}`}
        title="Share channel"
      >
        <Share2Icon size={16} aria-hidden />
        {!iconOnly && <span className="ml-1.5">Share</span>}
      </Button>
      <Dialog.Root isOpen={open} onClose={() => setOpen(false)}>
        <Dialog.Title>Share channel</Dialog.Title>
        <Dialog.Description>{text}</Dialog.Description>
        <div className="mt-4 flex items-center gap-2">
          <code className="border-border bg-background-secondary min-w-0 flex-1 truncate rounded-md border px-3 py-2 text-sm">
            {url}
          </code>
          <CopyButton text={url} aria-label="Copy channel link" />
        </div>
        <Dialog.Actions>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </>
  );
}
