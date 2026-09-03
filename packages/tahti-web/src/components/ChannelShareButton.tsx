import { CodeIcon, Share2Icon } from 'lucide-react';
import { useState } from 'react';

import { Button, CopyButton, Dialog } from '@tahti-player/ui';

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
  const embedUrl = `${window.location.origin}/embed/c/${channelSlug}`;
  const embedSnippet = `<iframe src="${embedUrl}" width="100%" height="180" frameborder="0" allow="autoplay"></iframe>`;
  const text = `Listen to ${displayName} on Tahti`;

  if (!enabled) {
    return null;
  }

  return (
    <>
      <Button
        size={iconOnly ? 'icon-sm' : 'sm'}
        variant="secondary"
        onClick={() => setOpen(true)}
        aria-label={`Share ${displayName}`}
        title="Share or embed channel"
      >
        <Share2Icon size={16} aria-hidden />
        {!iconOnly && <span className="ml-1.5">Share</span>}
      </Button>
      <Dialog.Root isOpen={open} onClose={() => setOpen(false)}>
        <Dialog.Title>Share channel</Dialog.Title>
        <Dialog.Description>
          Share this channel or add its player to another site.
        </Dialog.Description>
        <div className="mt-4 flex flex-col gap-5">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Share2Icon size={16} aria-hidden />
              <h3 className="text-sm font-bold">Share</h3>
            </div>
            <p className="text-foreground-secondary text-sm">{text}</p>
            <div className="flex items-center gap-2">
              <code className="border-border bg-background-secondary min-w-0 flex-1 overflow-x-auto rounded-md border px-3 py-2 text-sm whitespace-nowrap">
                {url}
              </code>
              <CopyButton
                text={url}
                aria-label="Copy channel link"
                toastMessage="Link copied."
              />
            </div>
            <div className="flex items-center gap-2">
              <code className="border-border bg-background-secondary min-w-0 flex-1 overflow-x-auto rounded-md border px-3 py-2 text-sm whitespace-nowrap">
                {text}
              </code>
              <CopyButton
                text={text}
                aria-label="Copy share message"
                toastMessage="Message copied."
              />
            </div>
          </section>
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CodeIcon size={16} aria-hidden />
              <h3 className="text-sm font-bold">Embed</h3>
            </div>
            <div className="flex items-center gap-2">
              <code className="border-border bg-background-secondary min-w-0 flex-1 overflow-x-auto rounded-md border px-3 py-2 text-sm whitespace-nowrap">
                {embedUrl}
              </code>
              <CopyButton
                text={embedUrl}
                aria-label="Copy embed link"
                toastMessage="Link copied."
              />
            </div>
            <div className="flex items-center gap-2">
              <code className="border-border bg-background-secondary min-w-0 flex-1 overflow-x-auto rounded-md border px-3 py-2 text-xs whitespace-nowrap">
                {embedSnippet}
              </code>
              <CopyButton
                text={embedSnippet}
                aria-label="Copy iframe code"
                toastMessage="Embed code copied."
              />
            </div>
          </section>
        </div>
        <Dialog.Actions>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </>
  );
}
