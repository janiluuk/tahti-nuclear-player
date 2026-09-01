import { UploadIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { AdminGate } from '../../components/AdminGate';
import { AdminPageLayout } from '../../components/AdminNav';
import { ArtworkPresetUploadDialog } from '../../components/ArtworkPresetUploadDialog';
import {
  GENERATED_ARTWORK_COUNT,
  generatedArtworkUrl,
} from '../../lib/placeholderArt';

const STORAGE_KEY = 'tahti-admin-artwork-presets';

function defaultPresets() {
  return Array.from({ length: GENERATED_ARTWORK_COUNT }, (_, index) =>
    generatedArtworkUrl(String(index)),
  );
}

export function AdminArtworkPresetsView() {
  const [presets, setPresets] = useState<string[]>(defaultPresets);
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const selectedUrl = presets[selected] ?? '';
  const presetNames = useMemo(
    () => presets.map((_, index) => `Artwork ${index + 1}`),
    [presets],
  );
  // The default preset (index `selected`) always renders first in the grid
  // so it's immediately visible rather than wherever it happens to sit.
  const orderedIndices = useMemo(() => {
    const rest = presets.map((_, index) => index).filter((i) => i !== selected);
    return [selected, ...rest];
  }, [presets, selected]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed: unknown = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.length === GENERATED_ARTWORK_COUNT &&
        parsed.every((value): value is string => typeof value === 'string')
      ) {
        setPresets(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const save = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <AdminGate>
      <AdminPageLayout current="/admin/artwork-presets">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold">Artwork presets</h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Manage the abstract thumbnails used when a new upload has no
              artwork. Choose a preset to edit or make it the default.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {orderedIndices.map((index) => (
              <button
                key={presetNames[index]}
                type="button"
                onClick={() => setSelected(index)}
                className={`border-border overflow-hidden rounded-lg border text-left ${selected === index ? 'ring-primary ring-2' : ''}`}
                aria-label={`Edit ${presetNames[index]}`}
              >
                <img
                  src={presets[index]}
                  alt=""
                  className="aspect-square w-full"
                />
                <span className="block px-2 py-1 text-xs">
                  {presetNames[index]}
                </span>
              </button>
            ))}
          </div>
          <div className="border-border bg-background-secondary grid gap-5 rounded-xl border p-4 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-4">
              <Input
                label="Default preset"
                value={presetNames[selected] ?? ''}
                readOnly
                description="New artwork-free uploads use this selection in this browser until a replacement is saved."
              />
              <Button onClick={save}>{saved ? 'Saved' : 'Save presets'}</Button>
            </div>
            <div className="group relative aspect-square w-full max-w-64">
              <img
                src={selectedUrl}
                alt="Selected artwork preset"
                className="h-full w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                aria-label={`Replace ${presetNames[selected] ?? 'preset'}`}
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
              >
                <UploadIcon size={28} aria-hidden className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </AdminPageLayout>
      <ArtworkPresetUploadDialog
        isOpen={uploadOpen}
        label={presetNames[selected] ?? 'preset'}
        onClose={() => setUploadOpen(false)}
        onUploaded={(url) => {
          setPresets((current) =>
            current.map((preset, index) => (index === selected ? url : preset)),
          );
        }}
      />
    </AdminGate>
  );
}
