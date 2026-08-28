import { ImageUploadField } from './ImageUploadField';

export function ShowImagePicker({
  label,
  description,
  value,
  onUrlChange,
}: {
  label: string;
  description: string;
  value: string;
  file?: File | null;
  onFile?: (file: File | null) => void;
  onUrlChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ImageUploadField
        label={label}
        description={description}
        value={value}
        onChange={onUrlChange}
      />
    </div>
  );
}
