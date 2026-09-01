import { ImageIcon, UploadCloudIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Dialog, FilePicker } from '@tahti-player/ui';

import { uploadUserMediaFile } from '../api/user-media';
import { cn } from '../lib/cn';

type UploadResult =
  | { ok: true; data: { url: string } }
  | { ok: false; error: string };

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  /** Used for aria labels, dialog copy, and the success toast. */
  label: string;
  className?: string;
  /** Overrides the default generic media upload. */
  upload?: (file: File) => Promise<UploadResult>;
};

/** A wide, clickable backdrop slot — same click-to-upload-modal idiom as
 * RoundImageUploadButton, but a rectangular banner shape with a plain
 * placeholder when empty instead of a round avatar. */
export function BackdropUploadButton({
  value,
  onChange,
  label,
  className,
  upload = uploadUserMediaFile,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: readonly File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    setBusy(true);
    const result = await upload(file);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onChange(result.data.url);
    toast.success(`${label} updated.`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Change ${label.toLowerCase()}`}
        title={`Change ${label.toLowerCase()}`}
        className={cn(
          'group border-border bg-background-secondary relative flex aspect-[3/1] w-full items-center justify-center overflow-hidden rounded-xl border',
          className,
        )}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <ImageIcon
            size={28}
            aria-hidden
            className="text-foreground-secondary"
          />
        )}
        <div className="bg-background/80 text-foreground pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <UploadCloudIcon size={22} aria-hidden />
        </div>
      </button>

      <Dialog.Root
        isOpen={open}
        onClose={() => {
          if (!busy) {
            setOpen(false);
          }
        }}
        className="max-w-md"
      >
        <Dialog.Title>{label}</Dialog.Title>
        <Dialog.Description>
          Wide JPEG, PNG, or WebP. Uploads immediately once selected.
        </Dialog.Description>
        <div className="mt-4">
          <FilePicker
            labels={{
              title: label,
              description: 'Wide JPEG, PNG, or WebP',
              browse: busy ? 'Uploading…' : 'Choose image',
            }}
            accept="image/jpeg,image/png,image/webp"
            selectedFiles={[]}
            disabled={busy}
            onFiles={(files) => void handleFiles(Array.from(files))}
          />
        </div>
      </Dialog.Root>
    </>
  );
}
