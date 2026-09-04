import { LoaderCircleIcon, UploadCloudIcon } from 'lucide-react';
import { useRef, useState, type FC, type RefObject } from 'react';
import { toast } from 'sonner';

import { ImageReveal } from '@tahti-player/ui';

import { cn } from '../lib/cn';
import { IMAGE_UPLOAD_ACCEPT_ATTR } from '../lib/imageUploadContentType';
import {
  canEditRadioStationCover,
  persistRadioStationCover,
  uploadRadioCoverFile,
} from '../lib/radioStationCover';
import { useAuthStore } from '../stores/authStore';

type RadioStationCoverProps = {
  src: string;
  label: string;
  stationName: string;
  catalogStationId?: string;
  presetId?: string;
  className?: string;
  persist?: boolean;
  onCoverChange?: (url: string) => void;
};

type RadioStationCoverEditButtonProps = Omit<RadioStationCoverProps, 'src'> & {
  className?: string;
};

const openCoverPicker = (
  inputRef: RefObject<HTMLInputElement | null>,
  busy: boolean,
) => {
  if (!busy) {
    inputRef.current?.click();
  }
};

async function replaceCover(options: {
  file: File | undefined;
  label: string;
  stationName: string;
  catalogStationId?: string;
  presetId?: string;
  persist: boolean;
  onCoverChange?: (url: string) => void;
}): Promise<void> {
  if (!options.file) {
    return;
  }
  const uploaded = await uploadRadioCoverFile(options.file);
  if (!uploaded.ok) {
    toast.error(uploaded.error);
    return;
  }
  if (options.persist) {
    const persisted = await persistRadioStationCover({
      catalogStationId: options.catalogStationId,
      presetId: options.presetId,
      stationName: options.stationName,
      logoUrl: uploaded.data.url,
    });
    if (!persisted.ok) {
      toast.error(persisted.error);
      return;
    }
  }
  options.onCoverChange?.(uploaded.data.url);
  toast.success(`${options.label} cover updated.`);
}

export const RadioStationCoverEditButton: FC<
  RadioStationCoverEditButtonProps
> = ({
  label,
  stationName,
  catalogStationId,
  presetId,
  className,
  persist = true,
  onCoverChange,
}) => {
  const user = useAuthStore((state) => state.user);
  const canEdit = canEditRadioStationCover(user);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        title={`Edit ${label} cover`}
        aria-label={`Edit ${label} cover`}
        data-testid="radio-station-cover-edit"
        className={cn(
          'flex cursor-pointer items-center justify-center border-0 p-0',
          'bg-background/80 hover:bg-background/90 disabled:cursor-wait',
          'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          'size-8 rounded-full',
          className,
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openCoverPicker(inputRef, busy);
        }}
      >
        {busy ? (
          <LoaderCircleIcon size={18} aria-hidden className="animate-spin" />
        ) : (
          <UploadCloudIcon size={18} aria-hidden />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT_ATTR}
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          setBusy(true);
          void replaceCover({
            file,
            label,
            stationName,
            catalogStationId,
            presetId,
            persist,
            onCoverChange,
          }).finally(() => setBusy(false));
        }}
      />
    </>
  );
};

export const RadioStationCover: FC<RadioStationCoverProps> = ({
  src,
  label,
  stationName,
  catalogStationId,
  presetId,
  className,
  persist = true,
  onCoverChange,
}) => {
  const user = useAuthStore((state) => state.user);
  const canEdit = canEditRadioStationCover(user);

  return (
    <div
      data-testid="radio-station-cover"
      className={cn('group relative size-full', className)}
    >
      <div data-testid="radio-station-cover-image" className="size-full">
        <ImageReveal
          src={src || undefined}
          alt=""
          className="size-full"
          placeholder={<div className="bg-background-secondary size-full" />}
        />
      </div>
      {canEdit ? (
        <RadioStationCoverEditButton
          label={label}
          stationName={stationName}
          catalogStationId={catalogStationId}
          presetId={presetId}
          persist={persist}
          onCoverChange={onCoverChange}
          className="absolute inset-0 size-full rounded-[inherit]"
        />
      ) : null}
    </div>
  );
};
