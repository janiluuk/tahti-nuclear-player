import { Button } from '@nuclearplayer/ui';

import { PageFrame, PageHeader } from '../components/PageHeader';
import { useThemeStore } from '../stores/themeStore';

const MODE_OPTIONS = [
  { id: 'light' as const, label: 'Light' },
  { id: 'dark' as const, label: 'Dark' },
  { id: 'dynamic' as const, label: 'Dynamic' },
];

export function ThemesView() {
  const { themes, themeId, colorMode, setTheme, setColorMode } =
    useThemeStore();

  return (
    <PageFrame maxWidth="2xl">
      <PageHeader
        title="Themes"
        subtitle="Choose how Nuclear looks and feels."
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Mode</span>
          {MODE_OPTIONS.map((mode) => (
            <Button
              key={mode.id}
              size="sm"
              variant={colorMode === mode.id ? undefined : 'text'}
              onClick={() => setColorMode(mode.id)}
            >
              {mode.label}
            </Button>
          ))}
        </div>
        {colorMode === 'dynamic' && (
          <p className="text-foreground-secondary text-xs">
            Dark from 7pm to 7am, light the rest of the day.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const active = theme.id === themeId;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={
                active
                  ? 'border-border bg-primary rounded-lg border p-4 text-left'
                  : 'border-border bg-background hover:bg-background-secondary rounded-lg border p-4 text-left'
              }
            >
              <div className="mb-3 flex gap-2">
                {theme.palette.map((color) => (
                  <span
                    key={color}
                    className="border-border size-8 rounded-md border"
                    style={{ background: color }}
                  />
                ))}
              </div>
              <div className="font-bold">{theme.name}</div>
              <div className="text-foreground-secondary text-xs">
                {theme.id}
              </div>
            </button>
          );
        })}
      </div>
    </PageFrame>
  );
}
