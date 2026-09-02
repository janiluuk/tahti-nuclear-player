import { PencilIcon } from 'lucide-react';
import { useRef, useState, type FC, type RefObject } from 'react';
import { toast } from 'sonner';

import { Button } from '@tahti-player/ui';

import { cn } from '../lib/cn';
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
      <Button
        type="button"
        size="icon-sm"
        variant="text"
        disabled={busy}
        title={`Edit ${label} cover`}
        aria-label={`Edit ${label} cover`}
        data-testid="radio-station-cover-edit"
        className={cn(
          'bg-background/80 hover:bg-background opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          className,
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openCoverPicker(inputRef, busy);
        }}
      >
        <PencilIcon size={14} aria-hidden />
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
      {src ? (
        <img
          key={src}
          src={src}
          alt=""
          className="size-full object-cover"
          data-testid="radio-station-cover-image"
        />
      ) : (
        <div
          className="bg-background-secondary size-full"
          data-testid="radio-station-cover-image"
        />
      )}
      {canEdit ? (
        <RadioStationCoverEditButton
          label={label}
          stationName={stationName}
          catalogStationId={catalogStationId}
          presetId={presetId}
          persist={persist}
          onCoverChange={onCoverChange}
          className="absolute inset-0 size-full rounded-none"
        />
      ) : null}
    </div>
  );
};
