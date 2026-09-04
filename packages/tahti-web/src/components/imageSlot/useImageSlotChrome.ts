import { useState } from 'react';

type UseImageSlotChromeOptions = {
  onClear: () => void | Promise<void>;
};

/** Shared state for the hover-delete + preview-modal chrome on a "set
 * image" upload slot (avatar, backdrop, cover, slideshow frame, …). */
export function useImageSlotChrome({ onClear }: UseImageSlotChromeOptions) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const confirmDelete = async () => {
    setClearing(true);
    await onClear();
    setClearing(false);
    setConfirmOpen(false);
    setPreviewOpen(false);
  };

  return {
    previewOpen,
    openPreview: () => setPreviewOpen(true),
    closePreview: () => setPreviewOpen(false),
    confirmOpen,
    clearing,
    requestDelete: () => setConfirmOpen(true),
    cancelDelete: () => setConfirmOpen(false),
    confirmDelete,
  };
}
