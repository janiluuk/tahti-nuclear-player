import { FileJson } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { applyAdvancedTheme, type AdvancedTheme } from '@nuclearplayer/themes';
import { Button, Dialog, Input } from '@nuclearplayer/ui';

import { useThemeStore } from '../plugins/themes';

type VarField = { key: string; label: string };

const CORE_VARS: VarField[] = [
  { key: 'background', label: 'Background' },
  { key: 'background-secondary', label: 'Background (secondary)' },
  { key: 'foreground', label: 'Text' },
  { key: 'foreground-secondary', label: 'Text (secondary)' },
  { key: 'primary', label: 'Primary' },
  { key: 'primary-foreground', label: 'Text on primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'secondary-foreground', label: 'Text on secondary' },
  { key: 'border', label: 'Border' },
];

const ACCENT_VARS: VarField[] = [
  { key: 'accent-green', label: 'Green' },
  { key: 'accent-yellow', label: 'Yellow' },
  { key: 'accent-purple', label: 'Purple' },
  { key: 'accent-blue', label: 'Blue' },
  { key: 'accent-orange', label: 'Orange' },
  { key: 'accent-cyan', label: 'Cyan' },
  { key: 'accent-red', label: 'Red' },
];

const ALL_VARS = [...CORE_VARS, ...ACCENT_VARS];

function currentValue(key: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${key}`)
    .trim();
}

function nonEmpty(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).filter(([, v]) => v.trim() !== ''),
  );
}

function colorToHex(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split('')
      .map((part) => part + part)
      .join('')}`;
  }
  if (typeof document === 'undefined') {
    return '#888888';
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    return '#888888';
  }
  context.fillStyle = '#888888';
  context.fillStyle = trimmed;
  const [red, green, blue] = context.fillStyle.match(/\d+/g)?.map(Number) ?? [];
  if ([red, green, blue].some((channel) => channel === undefined)) {
    return '#888888';
  }
  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToHsl(value: string): [number, number, number] {
  const hex = colorToHex(value).slice(1);
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const [red, green, blue] = channels;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) {
    return [0, 0, lightness];
  }
  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue =
    (max === red
      ? (green - blue) / delta + (green < blue ? 6 : 0)
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4) / 6;
  hue *= 360;
  return [hue, saturation, lightness];
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  const offset = lightness - chroma / 2;
  return `#${match
    .map((channel) =>
      Math.round((channel + offset) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Visual editor for a custom theme: overrides a curated set of CSS
 * variables (see @nuclearplayer/themes' AdvancedThemeSchema) with live
 * preview via `applyAdvancedTheme`, then hands the assembled theme to
 * `importCustomTheme` to persist + activate it. Unfilled fields are left
 * out of the saved theme, so they keep inheriting from the base palette
 * — this edits a set of *overrides*, not a full theme from scratch. */
export function ThemeEditor() {
  const dark = useThemeStore((s) => s.dark);
  const themeId = useThemeStore((s) => s.themeId);
  const importCustomTheme = useThemeStore((s) => s.importCustomTheme);
  const originalThemeId = useRef(themeId);

  const [name, setName] = useState('My theme');
  const [lightValues, setLightValues] = useState<Record<string, string>>({});
  const [darkValues, setDarkValues] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const activeValues = dark ? darkValues : lightValues;
  const setActiveValues = dark ? setDarkValues : setLightValues;

  const draft: AdvancedTheme = useMemo(
    () => ({
      version: 1,
      name: name.trim() || 'Draft',
      vars: nonEmpty(lightValues),
      dark: nonEmpty(darkValues),
    }),
    [name, lightValues, darkValues],
  );

  // Live preview every edit. Restore whatever theme was actually active
  // when this editor unmounts, so navigating away doesn't leave the
  // preview stuck applied.
  useEffect(() => {
    applyAdvancedTheme(draft);
  }, [draft]);

  useEffect(
    () => () => {
      useThemeStore.getState().setTheme(originalThemeId.current);
    },
    [],
  );

  const save = () => {
    const result = importCustomTheme(draft);
    setSaveMsg(result.ok ? 'Saved and applied.' : result.error);
  };

  const importTheme = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      setImportMsg('Not valid JSON.');
      return;
    }
    const result = importCustomTheme(parsed);
    if (!result.ok) {
      setImportMsg(result.error);
      return;
    }
    setImportMsg('Theme imported and applied.');
    setImportJson('');
    setImportOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-foreground-secondary text-sm">
        Editing the <strong>{dark ? 'dark' : 'light'}</strong> variant — switch
        appearance above to edit the other one. Leave a field blank to keep
        inheriting the base palette there.
      </p>

      <Input
        label="Theme name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ALL_VARS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1 text-sm">
            {field.label}
            {(() => {
              const value = activeValues[field.key] || currentValue(field.key);
              const [hue, saturation, lightness] = hexToHsl(value);
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="border-border size-8 shrink-0 rounded-md border"
                      style={{
                        background:
                          activeValues[field.key] || currentValue(field.key),
                      }}
                      aria-hidden
                    />
                    <input
                      type="color"
                      value={colorToHex(value)}
                      onChange={(e) =>
                        setActiveValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="border-border size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
                      aria-label={`Pick ${field.label} color`}
                    />
                    <input
                      type="text"
                      value={activeValues[field.key] ?? ''}
                      onChange={(e) =>
                        setActiveValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={currentValue(field.key)}
                      className="border-border bg-background h-9 flex-1 rounded-md border px-2 font-mono text-xs"
                    />
                  </div>
                  <div className="text-foreground-secondary mt-1 flex items-center gap-2 text-xs">
                    <span className="w-10 shrink-0">Hue</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={hue}
                      onChange={(e) =>
                        setActiveValues((prev) => ({
                          ...prev,
                          [field.key]: hslToHex(
                            Number(e.target.value),
                            saturation,
                            lightness,
                          ),
                        }))
                      }
                      className="accent-primary min-w-0 flex-1"
                      aria-label={`Adjust ${field.label} hue`}
                    />
                    <span className="w-8 text-right tabular-nums">
                      {Math.round(hue)}°
                    </span>
                  </div>
                </>
              );
            })()}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save}>
          Save as theme
        </Button>
        {saveMsg && (
          <span className="text-foreground-secondary text-xs">{saveMsg}</span>
        )}
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label="Import theme JSON"
          title="Import theme JSON"
          onClick={() => setImportOpen(true)}
        >
          <FileJson size={16} aria-hidden />
        </Button>
      </div>
      <Dialog.Root
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        className="max-w-xl"
      >
        <Dialog.Title>Import theme JSON</Dialog.Title>
        <Dialog.Description>
          Paste a version 1 theme. It is validated before being added to your
          library.
        </Dialog.Description>
        <textarea
          value={importJson}
          onChange={(event) => {
            setImportJson(event.target.value);
            setImportMsg(null);
          }}
          rows={10}
          className="border-border bg-background text-foreground w-full rounded-md border px-3 py-2 font-mono text-xs"
          placeholder={
            '{\n  "version": 1,\n  "name": "My theme",\n  "vars": {}\n}'
          }
          aria-label="Theme JSON"
        />
        {importMsg ? (
          <p className="text-accent-red text-xs">{importMsg}</p>
        ) : null}
        <Dialog.Actions>
          <Dialog.Close>Cancel</Dialog.Close>
          <Button onClick={importTheme} disabled={!importJson.trim()}>
            Import and apply
          </Button>
        </Dialog.Actions>
      </Dialog.Root>
    </div>
  );
}
