import { ImageIcon, UploadCloudIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Dialog, FilePicker } from '@nuclearplayer/ui';

import { uploadUserMediaFile } from '../api/user-media';
import { cn } from '../lib/cn';

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  /** Used for aria labels, dialog copy, and the success toast. */
  label: string;
  /** Tailwind size classes for the circle — defaults to a compact form-field size. */
  sizeClassName?: string;
  className?: string;
};

/** A single round, clickable image slot — shows the uploaded image (or a
 * placeholder icon when none is set), and opens a small upload modal on
 * click. Replaces the always-visible dropzone box for contexts where only
 * one image is possible (a station/plugin logo, not a multi-purpose
 * gallery), so the field takes up no more room than the thumbnail itself. */
export function RoundImageUploadButton({
  value,
  onChange,
  label,
  sizeClassName = 'h-16 w-16',
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: readonly File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    setBusy(true);
    const result = await uploadUserMediaFile(file);
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
      <div className={cn('group relative inline-flex', className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Change ${label.toLowerCase()}`}
          title={`Change ${label.toLowerCase()}`}
          className={cn(
            'border-border bg-background-secondary flex items-center justify-center overflow-hidden rounded-full border-2',
            sizeClassName,
          )}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon
              size={20}
              aria-hidden
              className="text-foreground-secondary"
            />
          )}
        </button>
        <div className="bg-background/80 text-foreground pointer-events-none absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
          <UploadCloudIcon size={18} aria-hidden />
        </div>
      </div>

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
          JPEG, PNG, or WebP. Uploads immediately once selected.
        </Dialog.Description>
        <div className="mt-4">
          <FilePicker
            labels={{
              title: label,
              description: 'JPEG, PNG, or WebP',
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
