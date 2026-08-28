import { FilePicker, Input } from '@nuclearplayer/ui';

export function ShowImagePicker({
  label,
  description,
  value,
  file,
  onFile,
  onUrlChange,
}: {
  label: string;
  description: string;
  value: string;
  file: File | null;
  onFile: (file: File | null) => void;
  onUrlChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FilePicker
        labels={{
          title: label,
          description,
          browse: file ? 'Choose another image' : 'Choose image',
        }}
        accept="image/jpeg,image/png,image/webp,image/gif"
        selectedFiles={file ? [file] : []}
        onFiles={(files) => onFile(files[0] ?? null)}
      />
      <Input
        label={`${label} URL (optional)`}
        value={value}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://…"
      />
      {value ? (
        <img
          src={value}
          alt={`${label} preview`}
          className={
            label.toLowerCase().includes('backdrop')
              ? 'h-28 w-full rounded-md object-cover'
              : 'size-24 rounded-md object-cover'
          }
        />
      ) : null}
    </div>
  );
}
