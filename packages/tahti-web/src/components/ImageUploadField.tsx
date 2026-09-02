import { useState } from 'react';
import { toast } from 'sonner';

import { FilePicker } from '@tahti-player/ui';

import { uploadUserMediaFile } from '../api/user-media';

type Props = {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  className,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: readonly File[]) => {
    const selected = files[0];
    if (!selected) {
      return;
    }
    setFile(selected);
    setError(null);
    setBusy(true);
    const result = await uploadUserMediaFile(selected);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    onChange(result.data.url);
    toast.success(`${label} updated.`);
  };

  return (
    <div className={className}>
      <FilePicker
        labels={{
          title: label,
          description,
          browse: file ? 'Choose another image' : 'Choose image',
        }}
        accept="image/jpeg,image/png,image/webp,image/gif"
        selectedFiles={file ? [file] : []}
        disabled={busy}
        onFiles={handleFiles}
      />
      {value ? (
        <img
          src={value}
          alt={`${label} preview`}
          className="mt-2 h-20 w-20 rounded-md object-cover"
        />
      ) : null}
      {error ? <p className="text-accent-red mt-1 text-xs">{error}</p> : null}
    </div>
  );
}
