import {
  DEFAULT_COLOR_SCHEME,
  type ColorScheme,
} from '../../api/channel-design';

const COLOR_SCHEME_FIELDS = [
  ['accent', 'Accent / waveform played'],
  ['highlight', 'Highlight'],
  ['bg', 'Background'],
  ['text', 'Foreground'],
  ['muted', 'Muted / waveform unplayed'],
] as const;

type Props = {
  scheme: ColorScheme;
  onChange: (next: ColorScheme) => void;
};

/** Shared 5-swatch color pickers for header, player, and page palettes. */
export function ColorSchemeFields({ scheme, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {COLOR_SCHEME_FIELDS.map(([key, label]) => (
        <label
          key={key}
          className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3 text-sm"
        >
          <input
            type="color"
            value={scheme[key] ?? DEFAULT_COLOR_SCHEME[key]}
            onChange={(event) =>
              onChange({ ...scheme, [key]: event.target.value })
            }
            className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{label}</span>
            <code className="text-foreground-secondary text-xs">
              {scheme[key]}
            </code>
          </span>
        </label>
      ))}
    </div>
  );
}
