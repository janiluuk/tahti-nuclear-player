import {
  AudioLines,
  CheckIcon,
  Cloud,
  Droplets,
  Flashlight,
  Grid3x3,
  Loader2Icon,
  SaveIcon,
  Slash,
  Sparkles,
  Spline,
  Square,
  Sun,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Input,
  PluginItem,
  Slider,
  Tabs,
  Toggle,
} from '@nuclearplayer/ui';

import {
  BRAND_ACCENTS,
  DEFAULT_COLOR_SCHEME,
  fetchChannelVisual,
  fillColorScheme,
  HEADER_STYLES,
  isValidHeaderVideoUrl,
  isVisualPreset,
  parseColorScheme,
  parseVisualSettingsMap,
  patchChannelVisual,
  resolveVisualPresetSettings,
  shouldDockVisualizerTuning,
  VISUAL_PRESETS,
  type ChannelVisual,
  type ColorScheme,
  type VisualPreset,
  type VisualSettingsMap,
} from '../api/channel-design';
import { ChannelVisualizer } from './ChannelVisualizer';
import { Eyebrow } from './tahti/Eyebrow';

const PRESET_META: Record<
  VisualPreset,
  { description: string; Icon: LucideIcon }
> = {
  MINIMAL: {
    description: 'No animated background — solid color only.',
    Icon: Slash,
  },
  WATER_RIPPLE: {
    description: 'Soft ripple distortion synced to audio level.',
    Icon: Droplets,
  },
  WAVEFORM_BARS: {
    description: 'Classic frequency bars across the bottom.',
    Icon: AudioLines,
  },
  PARTICLE_FIELD: {
    description: 'Drifting particles that pulse with the beat.',
    Icon: Sparkles,
  },
  AURORA: {
    description: 'Flowing aurora-style color bands.',
    Icon: Waves,
  },
  REACTIVE_GRID: {
    description: 'Pulsing grid lines that react to the mix.',
    Icon: Grid3x3,
  },
  CLOUDSCAPE: {
    description: 'Slow-moving cloud gradients.',
    Icon: Cloud,
  },
  LINE_TANGLE: {
    description: 'Tangled line art that reacts to levels.',
    Icon: Spline,
  },
  BACKDROP_BOX: {
    description: 'Boxed grid backdrop, subtle motion.',
    Icon: Square,
  },
  LENS_FLARES: {
    description: 'Soft lens-flare glints over the artwork.',
    Icon: Sun,
  },
  IES_SPOTLIGHT: {
    description: 'Spotlight-style beam sweep.',
    Icon: Flashlight,
  },
};

const TAB_IDS = ['visualizer', 'colors', 'header'] as const;
type TabId = (typeof TAB_IDS)[number];

type Props = {
  displayName: string;
  username: string;
  channelSlug?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  /** Compact for profile tab; full for Studio. */
  compact?: boolean;
  /** Side-panel look controls only (no hero preview chrome). */
  lookOnly?: boolean;
  /** Mount a real, animating Three.js preview in the preview chrome (the
   * one place tuning docks). Default true. Set false wherever this
   * designer can render *underneath* a page that may already have its own
   * live ChannelVisualizer running — e.g. the global Settings modal, which
   * can stay open over the owner's own live channel page — so we never end
   * up with two live WebGL contexts at once (see 7a8060d7). */
  livePreview?: boolean;
  onSaved?: () => void;
  /** Remount / reload trigger when an external preset applies a look. */
  reloadToken?: number;
};

export function ChannelDesigner({
  displayName,
  username,
  channelSlug,
  avatarUrl,
  bio,
  compact,
  lookOnly,
  livePreview = true,
  onSaved,
  reloadToken = 0,
}: Props) {
  const [visual, setVisual] = useState<ChannelVisual | null>(null);
  const [scheme, setScheme] = useState<ColorScheme>({});
  const [visualSettings, setVisualSettings] = useState<VisualSettingsMap>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastVisualizerPreset, setLastVisualizerPreset] =
    useState<VisualPreset>('AURORA');
  const [activeTab, setActiveTab] = useState<TabId>('visualizer');

  useEffect(() => {
    void fetchChannelVisual().then((r) => {
      setVisual(r.data);
      setScheme(parseColorScheme(r.data.colorSchemeJson));
      setVisualSettings(parseVisualSettingsMap(r.data.visualSettingsJson));
      if (
        isVisualPreset(r.data.visualPreset) &&
        r.data.visualPreset !== 'MINIMAL'
      ) {
        setLastVisualizerPreset(r.data.visualPreset);
      }
      setDirty(false);
    });
  }, [reloadToken]);

  const previewStyle = useMemo(() => {
    const accent = scheme.accent ?? '#22D3EE';
    const highlight = scheme.highlight ?? '#A78BFA';
    const bg = scheme.bg ?? '#0B1220';
    const fg = scheme.text ?? '#F8FAFC';
    const brand = BRAND_ACCENTS.find((b) => b.id === visual?.brandAccentPreset);
    const gradient =
      visual?.headerStyle === 'SOLID'
        ? bg
        : (brand?.gradient ??
          `linear-gradient(135deg, ${highlight}, ${accent}, ${bg})`);
    return { accent, highlight, bg, fg, gradient };
  }, [scheme, visual?.brandAccentPreset, visual?.headerStyle]);

  const applyLocal = (
    next: Partial<ChannelVisual>,
    nextScheme?: ColorScheme,
  ) => {
    setVisual((v) => (v ? { ...v, ...next } : v));
    if (nextScheme) {
      setScheme(nextScheme);
    }
    setDirty(true);
  };

  const setPresetSetting = (
    preset: string,
    key: 'speed' | 'intensity',
    value: number,
  ) => {
    // Round away the 0.05-step float drift (e.g. 1 + 0.05*4 -> 1.2000000000000002)
    // before it lands in state and gets displayed/persisted.
    const rounded = Math.round(value * 100) / 100;
    setVisualSettings((current) => ({
      ...current,
      [preset]: {
        ...resolveVisualPresetSettings(current, preset),
        [key]: rounded,
      },
    }));
    setDirty(true);
  };

  const save = async () => {
    if (!visual) {
      return;
    }
    setBusy(true);
    const result = await patchChannelVisual({
      visualPreset: visual.visualPreset,
      headerStyle: visual.headerStyle,
      videoBackgroundUrl: visual.videoBackgroundUrl ?? null,
      brandAccentPreset: visual.brandAccentPreset,
      colorScheme: fillColorScheme(scheme),
      visualSettings,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setVisual(result.data);
    setScheme(parseColorScheme(result.data.colorSchemeJson));
    setVisualSettings(parseVisualSettingsMap(result.data.visualSettingsJson));
    setDirty(false);
    toast.success('Look saved — public channel will pick this up.');
    onSaved?.();
  };

  if (!visual) {
    return (
      <p className="text-foreground-secondary text-sm">Loading designer…</p>
    );
  }

  const visualizerEnabled = visual.visualPreset !== 'MINIMAL';

  // VIDEO_LOOP without a playable clip isn't a state worth saving — the
  // header would just render empty on the real channel page.
  const videoLoopNeedsUrl =
    visual.headerStyle === 'VIDEO_LOOP' &&
    !isValidHeaderVideoUrl(visual.videoBackgroundUrl);
  const showHeaderVideo =
    visual.headerStyle === 'VIDEO_LOOP' &&
    isValidHeaderVideoUrl(visual.videoBackgroundUrl);

  const setVisualizerEnabled = (enabled: boolean) => {
    if (
      !enabled &&
      isVisualPreset(visual.visualPreset) &&
      visual.visualPreset !== 'MINIMAL'
    ) {
      setLastVisualizerPreset(visual.visualPreset);
    }
    applyLocal({
      visualPreset: enabled ? lastVisualizerPreset : 'MINIMAL',
    });
  };

  // Shared by the docked-in-preview overlay (below, next to the live
  // preview) and the lookOnly fallback (inline, in this tab's own content —
  // lookOnly has no local live preview to dock into, since the real one
  // lives in the hero block elsewhere on the page in that flow).
  const tuningSliders = (
    <>
      {(['speed', 'intensity'] as const).map((key) => {
        const current = resolveVisualPresetSettings(
          visualSettings,
          visual.visualPreset,
        );
        return (
          <Slider
            key={key}
            label={key === 'speed' ? 'Speed' : 'Intensity'}
            min={0.25}
            max={2}
            step={0.05}
            unit="×"
            value={current[key]}
            onValueChange={(value) =>
              setPresetSetting(visual.visualPreset, key, value)
            }
          />
        );
      })}
    </>
  );

  // Only the full (non-lookOnly) chrome, with a live preview allowed, ever
  // gets a real preview to dock tuning into.
  const hasLivePreview = !lookOnly && livePreview;

  const dockTuning = shouldDockVisualizerTuning({
    preset: visual.visualPreset,
    visualizerEnabled,
    activeTab,
  });

  const controls = (
    <>
      <Tabs
        listClassName="flex-wrap border-border border-b pb-3"
        panelClassName="pt-2"
        selectedIndex={TAB_IDS.indexOf(activeTab)}
        onChange={(index) => setActiveTab(TAB_IDS[index] ?? 'visualizer')}
        items={[
          {
            id: 'visualizer',
            label: 'Visualizer',
            content: (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={visualizerEnabled}
                    onChange={setVisualizerEnabled}
                    aria-label="Use visualizer"
                  />
                  <span className="text-sm font-semibold">Use visualizer</span>
                </div>
                {visualizerEnabled && (
                  <div className="flex flex-col gap-2">
                    {VISUAL_PRESETS.filter(
                      (preset) => preset !== 'MINIMAL',
                    ).map((preset) => {
                      const meta = PRESET_META[preset];
                      const active = visual.visualPreset === preset;
                      return (
                        <PluginItem
                          key={preset}
                          icon={<meta.Icon size={22} aria-hidden />}
                          name={preset.replace(/_/g, ' ')}
                          author={active ? 'In use' : 'Visualizer'}
                          description={meta.description}
                          labels={{ by: '' }}
                          className={
                            active
                              ? 'ring-primary bg-primary/10 ring-2 ring-inset'
                              : undefined
                          }
                          rightAccessory={
                            <Button
                              size="sm"
                              variant={active ? undefined : 'secondary'}
                              disabled={active}
                              onClick={() => {
                                setLastVisualizerPreset(preset);
                                applyLocal({ visualPreset: preset });
                              }}
                            >
                              {active ? 'In use' : 'Use'}
                            </Button>
                          }
                        />
                      );
                    })}
                  </div>
                )}
                {/* When there's a live preview to dock into (see the preview
                    block in the main return), tuning shows there instead of
                    repeated here. lookOnly and livePreview=false have no
                    local preview to dock into, so they keep sliders inline. */}
                {!hasLivePreview && dockTuning && (
                  <div className="border-border flex flex-col gap-4 rounded-lg border p-3">
                    <Eyebrow>
                      Tune {visual.visualPreset.replace(/_/g, ' ')}
                    </Eyebrow>
                    {tuningSliders}
                  </div>
                )}
              </section>
            ),
          },
          {
            id: 'colors',
            label: 'Colors',
            content: (
              <section className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Eyebrow>Brand accent</Eyebrow>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_ACCENTS.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        title={brand.label}
                        aria-label={brand.label}
                        aria-pressed={visual.brandAccentPreset === brand.id}
                        onClick={() =>
                          applyLocal(
                            { brandAccentPreset: brand.id },
                            {
                              ...scheme,
                              accent: brand.accent,
                              highlight: brand.highlight,
                            },
                          )
                        }
                        className={`h-10 w-16 rounded-md border-2 transition-transform hover:scale-105 ${
                          visual.brandAccentPreset === brand.id
                            ? 'border-primary shadow-md'
                            : 'border-transparent'
                        }`}
                        style={{ background: brand.gradient }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ['accent', 'Accent'] as const,
                      ['highlight', 'Highlight'] as const,
                      ['bg', 'Background'] as const,
                      ['text', 'Foreground'] as const,
                      ['muted', 'Muted'] as const,
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3 text-sm"
                    >
                      <input
                        type="color"
                        value={scheme[key] ?? DEFAULT_COLOR_SCHEME[key]}
                        onChange={(event) => {
                          const next = { ...scheme, [key]: event.target.value };
                          applyLocal({}, next);
                        }}
                        className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {label}
                        </span>
                        <code className="text-foreground-secondary text-xs">
                          {scheme[key]}
                        </code>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            ),
          },
          {
            id: 'header',
            label: 'Header',
            content: (
              <section className="flex flex-col gap-3">
                <Eyebrow>Header style</Eyebrow>
                <div className="grid gap-2 sm:grid-cols-2">
                  {HEADER_STYLES.map((headerStyle) => {
                    const active = visual.headerStyle === headerStyle;
                    return (
                      <button
                        key={headerStyle}
                        type="button"
                        aria-pressed={active}
                        onClick={() => applyLocal({ headerStyle })}
                        className={`rounded-lg border p-4 text-left text-sm font-semibold tracking-wide uppercase transition-colors ${
                          active
                            ? 'border-primary bg-primary/10 ring-primary ring-1'
                            : 'border-border bg-background hover:bg-background-secondary text-foreground-secondary hover:text-foreground'
                        }`}
                      >
                        {headerStyle.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
                {visual.headerStyle === 'VIDEO_LOOP' && (
                  <div className="flex flex-col gap-1">
                    <Input
                      label="Video URL"
                      value={visual.videoBackgroundUrl ?? ''}
                      placeholder="https://cdn.example.com/loop.mp4"
                      onChange={(event) =>
                        applyLocal({ videoBackgroundUrl: event.target.value })
                      }
                    />
                    <p className="text-foreground-secondary text-xs">
                      Direct link to a muted, looping .mp4 or .webm clip — plays
                      behind your channel header.
                    </p>
                    {visual.videoBackgroundUrl &&
                      !isValidHeaderVideoUrl(visual.videoBackgroundUrl) && (
                        <p className="text-xs text-red-500">
                          Must be an HTTPS link ending in .mp4 or .webm.
                        </p>
                      )}
                  </div>
                )}
              </section>
            ),
          },
        ]}
      />

      <div className="border-border flex flex-wrap items-center gap-3 border-t pt-4">
        <Button
          size="icon"
          variant="secondary"
          disabled={busy || !dirty || videoLoopNeedsUrl}
          aria-label={
            busy ? 'Saving look…' : dirty ? 'Save look' : 'Look saved'
          }
          title={
            videoLoopNeedsUrl
              ? 'Add a valid video URL to save'
              : busy
                ? 'Saving…'
                : dirty
                  ? 'Save look'
                  : 'Saved'
          }
          onClick={() => void save()}
        >
          {busy ? (
            <Loader2Icon size={16} className="animate-spin" aria-hidden />
          ) : dirty ? (
            <SaveIcon size={16} aria-hidden />
          ) : (
            <CheckIcon size={16} aria-hidden />
          )}
        </Button>
      </div>
    </>
  );

  if (lookOnly) {
    return <div className="flex flex-col gap-3">{controls}</div>;
  }

  return (
    <div className={`flex flex-col gap-4 ${compact ? '' : 'max-w-3xl'}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            Design your channel
          </h2>
          <p className="text-foreground-secondary text-xs">
            Prefer editing on the live channel page — open your channel and hit
            Edit design.
          </p>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-white/10 p-5 shadow-lg"
        style={{
          background: showHeaderVideo ? previewStyle.bg : previewStyle.gradient,
          color: previewStyle.fg,
        }}
      >
        {showHeaderVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={visual.videoBackgroundUrl ?? undefined}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: previewStyle.bg }}
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 text-lg font-bold"
            style={{
              borderColor: previewStyle.accent,
              background: previewStyle.bg,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              displayName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl font-extrabold tracking-tight">
              {displayName}
            </div>
            <div className="text-sm opacity-80">
              @{username}
              {channelSlug ? ` · /${channelSlug}` : ''}
            </div>
            {bio && (
              <p className="mt-1 line-clamp-2 text-sm opacity-90">{bio}</p>
            )}
          </div>
          <span
            className="rounded px-2 py-1 text-[10px] font-bold tracking-wide uppercase"
            style={{ background: previewStyle.accent, color: '#0B1220' }}
          >
            {visual.visualPreset.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="relative mt-4 h-28 overflow-hidden rounded-lg sm:h-36">
          {hasLivePreview && visualizerEnabled ? (
            <ChannelVisualizer
              className="absolute inset-0 h-full w-full"
              preset={visual.visualPreset}
              colorScheme={scheme}
              visualSettingsJson={JSON.stringify(visualSettings)}
              artworkUrl={avatarUrl}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: previewStyle.bg }}
            />
          )}
          {/* Tuning docks inside the live preview it actually affects,
              instead of a separate box under the preset list below. */}
          {hasLivePreview && dockTuning && (
            <div className="border-border bg-background/90 absolute inset-x-2 bottom-2 flex flex-col gap-3 rounded-lg border p-3 shadow-lg backdrop-blur-sm">
              <Eyebrow>Tune {visual.visualPreset.replace(/_/g, ' ')}</Eyebrow>
              {tuningSliders}
            </div>
          )}
        </div>
      </div>

      {controls}
    </div>
  );
}
