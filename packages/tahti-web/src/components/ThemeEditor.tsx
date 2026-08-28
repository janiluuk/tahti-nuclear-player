import { useEffect, useMemo, useRef, useState } from 'react';

import { applyAdvancedTheme, type AdvancedTheme } from '@nuclearplayer/themes';
import { Button, Input } from '@nuclearplayer/ui';

import { useThemeStore } from '../plugins/themes';

type VarField = { key: string; label: string };

const CORE_VARS: VarField[] = [
  { key: 'background', label: 'Background' },
  { key: 'background-secondary', label: 'Background (secondary)' },
  { key: 'foreground', label: 'Text' },
  { key: 'foreground-secondary', label: 'Text (secondary)' },
  { key: 'primary', label: 'Primary' },
  { key: 'primary-foreground', label: 'Text on primary' },
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
      </div>
    </div>
  );
}
