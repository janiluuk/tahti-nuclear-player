import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';

import { Button } from '@nuclearplayer/ui';

export type LightboxImage = {
  imageUrl: string;
  title?: string | null;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  index: number;
  label: string;
  onIndexChange?: (index: number) => void;
  onClose: () => void;
};

export const ImageLightbox: FC<ImageLightboxProps> = ({
  images,
  index,
  label,
  onIndexChange,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const image = images[index];
  const canNavigate = images.length > 1 && Boolean(onIndexChange);

  const move = (direction: -1 | 1) => {
    if (!canNavigate || !onIndexChange) {
      return;
    }
    onIndexChange((index + direction + images.length) % images.length);
  };

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!image) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 outline-none"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        } else if (event.key === 'ArrowLeft') {
          move(-1);
        } else if (event.key === 'ArrowRight') {
          move(1);
        } else if (event.key === 'Home' && onIndexChange) {
          onIndexChange(0);
        } else if (event.key === 'End' && onIndexChange) {
          onIndexChange(images.length - 1);
        }
      }}
    >
      <Button
        size="icon-sm"
        variant="secondary"
        className="absolute top-4 right-4 z-10"
        aria-label="Close image viewer"
        title="Close"
        onClick={onClose}
      >
        <XIcon size={18} aria-hidden />
      </Button>
      {canNavigate ? (
        <>
          <Button
            size="icon-sm"
            variant="secondary"
            className="absolute top-1/2 left-4 z-10 -translate-y-1/2"
            aria-label="Previous image"
            title="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              move(-1);
            }}
          >
            <ChevronLeftIcon size={20} aria-hidden />
          </Button>
          <Button
            size="icon-sm"
            variant="secondary"
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2"
            aria-label="Next image"
            title="Next image"
            onClick={(event) => {
              event.stopPropagation();
              move(1);
            }}
          >
            <ChevronRightIcon size={20} aria-hidden />
          </Button>
        </>
      ) : null}
      <figure
        className="flex max-h-full max-w-full flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={image.imageUrl}
          alt={image.title ?? ''}
          className="max-h-[82vh] max-w-full object-contain"
        />
        <figcaption className="flex items-center gap-3 text-sm text-white">
          {image.title ? <span>{image.title}</span> : null}
          {images.length > 1 ? (
            <span className="font-mono text-white/70">
              {index + 1} / {images.length}
            </span>
          ) : null}
        </figcaption>
      </figure>
    </div>
  );
};
