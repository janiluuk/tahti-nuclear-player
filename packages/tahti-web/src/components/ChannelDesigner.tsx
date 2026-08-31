import { Link } from '@tanstack/react-router';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  ImagesIcon,
  LinkIcon,
  PaletteIcon,
  PlaySquareIcon,
  SettingsIcon,
  Trash2Icon,
  TypeIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  FilePicker,
  Input,
  PluginItem,
  SaveButton,
  Select,
  Slider,
  Tabs,
  Tooltip,
} from '@nuclearplayer/ui';

import {
  BRAND_ACCENTS,
  DEFAULT_COLOR_SCHEME,
  fetchChannelVisual,
  fillColorScheme,
  HEADER_STYLES,
  isHeaderImageUrl,
  isValidHeaderBackdropUrl,
  isVisualPreset,
  MAX_HEADER_VIDEO_BYTES,
  parseColorScheme,
  parseVisualSettingsMap,
  patchChannelVisual,
  resolveVisualPresetSettings,
  shouldDockVisualizerTuning,
  uploadChannelHeaderVideo,
  VISUAL_PRESETS,
  youtubeEmbedUrl,
  type ChannelVisual,
  type ColorScheme,
  type VisualPreset,
  type VisualSettingsMap,
} from '../api/channel-design';
import {
  fetchChannelGallery,
  patchChannelGallery,
  type ChannelGalleryMode,
} from '../api/channel-gallery';
import { uploadUserMediaFile } from '../api/user-media';
import {
  DEFAULT_NOW_PLAYING_OVERLAY_SETTINGS,
  NOW_PLAYING_OVERLAY_PRESETS,
  parseNowPlayingOverlaySettings,
  resolveNowPlayingOverlayPreset,
  type NowPlayingOverlaySettings,
} from '../content/nowPlayingOverlayPresets';
import { visualizerMetadata } from '../plugins/visualizers';
import { ChannelControlsWidget } from './ChannelControlsWidget';
import { ChannelVisualizer } from './ChannelVisualizer';
import { NowPlayingOverlay } from './NowPlayingOverlay';
import { PageLoading } from './PageStates';
import { Eyebrow } from './tahti/Eyebrow';

type TabId = 'visualizer' | 'color-scheme' | 'header';
type PlayerDesignTab = 'gradient' | 'video-image' | 'visualizer';

const HEADER_MEDIA_TYPES = [
  'video/mp4',
  'video/webm',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const HEADER_DESIGN_OPTIONS = [...HEADER_STYLES, 'SLIDESHOW'] as const;

const GALLERY_MODES: Array<{ id: ChannelGalleryMode; label: string }> = [
  { id: 'NONE', label: 'None' },
  { id: 'STATIC_SLIDESHOW', label: 'Static slideshow' },
  { id: 'TWISTED_WAVE_GLSL', label: 'Twisted wave (WebGL)' },
  { id: 'ZOOM_BLUR_GLSL', label: 'Cinematic zoom blur (WebGL)' },
  { id: 'RGB_SHIFT_GLSL', label: 'RGB shift strip (WebGL)' },
  { id: 'POSTER_WALL_GLSL', label: 'Poster scroll wall (WebGL)' },
  { id: 'SHATTER_CAROUSEL_GLSL', label: 'Shatter carousel (WebGL)' },
];

const SLIDESHOW_PRESETS = [
  ['FADE', 'Fade'],
  ['ZOOM', 'Zoom'],
  ['PAN', 'Pan'],
  ['BLUR_CROSS', 'Blur crossfade'],
  ['PARTICLE_DISSOLVE', 'Particle dissolve'],
  ['GLITCH_WIPE', 'Glitch wipe'],
  ['CUBE_FLIP', 'Cube flip'],
  ['LIQUID_DISTORTION', 'Liquid distortion'],
] as const;

const COLOR_SCHEME_FIELDS = [
  ['accent', 'Accent / waveform played'],
  ['highlight', 'Highlight'],
  ['bg', 'Background'],
  ['text', 'Foreground'],
  ['muted', 'Muted / waveform unplayed'],
] as const;

/** The 5 raw color pickers shared by the header's color-scheme editor and
 * the player's independent gradient (when enabled) — kept separate from the
 * header's brand-accent swatches, which are a header-only concept. */
function ColorSchemeFields({
  scheme,
  onChange,
}: {
  scheme: ColorScheme;
  onChange: (next: ColorScheme) => void;
}) {
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
  /** Which look section should open when embedded in the full channel editor. */
  lookOpenSection?: 'player-design' | 'visual-style' | null;
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
  lookOpenSection,
}: Props) {
  const [visual, setVisual] = useState<ChannelVisual | null>(null);
  const [scheme, setScheme] = useState<ColorScheme>({});
  const [playerScheme, setPlayerScheme] = useState<ColorScheme>({});
  const [visualSettings, setVisualSettings] = useState<VisualSettingsMap>({});
  const [galleryMode, setGalleryMode] = useState<ChannelGalleryMode>('NONE');
  const [galleryImages, setGalleryImages] = useState('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(
    null,
  );
  const [galleryPreviewIndex, setGalleryPreviewIndex] = useState(0);
  const [videoBackgroundUrl, setVideoBackgroundUrl] = useState('');
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoPreviewUrl, setPendingVideoPreviewUrl] = useState<
    string | null
  >(null);
  const [videoUrlOpen, setVideoUrlOpen] = useState(false);
  const [slideshowPreset, setSlideshowPreset] = useState('FADE');
  const [slideshowInterval, setSlideshowInterval] = useState(8);
  const [slideshowTransition, setSlideshowTransition] = useState(600);
  const [slideshowAutoplay, setSlideshowAutoplay] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [previewPreset, setPreviewPreset] = useState<VisualPreset>('AURORA');
  const [showVisualizerSettings, setShowVisualizerSettings] = useState(false);
  const [overlaySettings, setOverlaySettings] =
    useState<NowPlayingOverlaySettings>(DEFAULT_NOW_PLAYING_OVERLAY_SETTINGS);
  const [overlayConfigOpen, setOverlayConfigOpen] = useState(false);
  const [visualizerPickerOpen, setVisualizerPickerOpen] = useState(false);
  const [visualizerPickerPreset, setVisualizerPickerPreset] =
    useState<Exclude<VisualPreset, 'MINIMAL'>>('AURORA');
  const [activeTab, setActiveTab] = useState<TabId>('visualizer');
  const [playerDesignTab, setPlayerDesignTab] =
    useState<PlayerDesignTab>('gradient');
  const [highlightSection, setHighlightSection] = useState<
    'header' | 'visualizer' | null
  >(null);
  const [openSectionId, setOpenSectionId] = useState<
    'player-design' | 'visual-style' | 'now-playing' | null
  >(lookOpenSection ?? 'visual-style');

  const handleOpenSectionChange = (id: string | null) => {
    if (
      id === null ||
      id === 'player-design' ||
      id === 'visual-style' ||
      id === 'now-playing'
    ) {
      setOpenSectionId(id);
    }
  };

  useEffect(() => {
    if (lookOpenSection !== undefined) {
      setOpenSectionId(lookOpenSection);
    }
  }, [lookOpenSection]);

  const focusPreviewSection = (
    tab: 'header' | 'visualizer',
    elementId: string,
  ) => {
    setActiveTab(tab);
    setHighlightSection(tab);
    setOpenSectionId(tab === 'header' ? 'visual-style' : 'player-design');
    document
      .getElementById(elementId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      setHighlightSection((current) => (current === tab ? null : current));
    }, 1600);
  };

  useEffect(() => {
    void Promise.all([fetchChannelVisual(), fetchChannelGallery()]).then(
      ([visualResult, galleryResult]) => {
        setVisual(visualResult.data);
        setOverlaySettings(
          parseNowPlayingOverlaySettings(
            visualResult.data.nowPlayingOverlaySettingsJson,
          ),
        );
        setScheme(parseColorScheme(visualResult.data.colorSchemeJson));
        setPlayerScheme(
          parseColorScheme(visualResult.data.playerColorSchemeJson),
        );
        setVisualSettings(
          parseVisualSettingsMap(visualResult.data.visualSettingsJson),
        );
        if (
          isVisualPreset(visualResult.data.visualPreset) &&
          visualResult.data.visualPreset !== 'MINIMAL'
        ) {
          setPreviewPreset(visualResult.data.visualPreset);
        } else {
          setPreviewPreset('AURORA');
          setVisual({ ...visualResult.data, visualPreset: 'AURORA' });
          setDirty(true);
        }
        setGalleryMode(galleryResult.data.galleryMode);
        setGalleryImages(galleryResult.data.slideshowImages.join('\n'));
        setVideoBackgroundUrl(galleryResult.data.videoBackgroundUrl ?? '');
        setSlideshowPreset(visualResult.data.slideshowPreset ?? 'FADE');
        setSlideshowInterval(visualResult.data.slideshowIntervalSeconds ?? 8);
        setSlideshowTransition(visualResult.data.slideshowTransitionMs ?? 600);
        setSlideshowAutoplay(visualResult.data.slideshowAutoplay ?? true);
        setDirty(false);
      },
    );
  }, [reloadToken]);

  const galleryImageList = useMemo(
    () =>
      galleryImages
        .split(/\r?\n/)
        .map((image) => image.trim())
        .filter(Boolean),
    [galleryImages],
  );

  useEffect(() => {
    setGalleryPreviewIndex(0);
  }, [galleryImages]);

  useEffect(() => {
    if (galleryImageList.length < 2 || !slideshowAutoplay) {
      return;
    }
    const timer = window.setInterval(() => {
      setGalleryPreviewIndex((index) => (index + 1) % galleryImageList.length);
    }, slideshowInterval * 1000);
    return () => window.clearInterval(timer);
  }, [galleryImageList.length, slideshowAutoplay, slideshowInterval]);

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
    if (next.visualPreset && isVisualPreset(next.visualPreset)) {
      setPreviewPreset(next.visualPreset);
    }
    if (nextScheme) {
      setScheme(nextScheme);
    }
    setDirty(true);
  };

  const selectVideoFile = (files: readonly File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    if (file.size > MAX_HEADER_VIDEO_BYTES) {
      toast.error('File must be 10 MB or smaller.');
      return;
    }
    if (!HEADER_MEDIA_TYPES.includes(file.type)) {
      toast.error('Use an MP4/WebM video or a JPEG/PNG/WebP/GIF image.');
      return;
    }
    if (pendingVideoPreviewUrl) {
      URL.revokeObjectURL(pendingVideoPreviewUrl);
    }
    setPendingVideoFile(file);
    setPendingVideoPreviewUrl(URL.createObjectURL(file));
    setDirty(true);
  };

  const clearVideo = () => {
    if (pendingVideoPreviewUrl) {
      URL.revokeObjectURL(pendingVideoPreviewUrl);
    }
    setPendingVideoFile(null);
    setPendingVideoPreviewUrl(null);
    setVideoBackgroundUrl('');
    setDirty(true);
  };

  const removeBackdrop = () => {
    clearVideo();
    setGalleryImages('');
    setGalleryMode('NONE');
  };

  const selectGalleryFiles = async (files: readonly File[]) => {
    const imageFiles = files.filter((file) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    );
    if (imageFiles.length === 0) {
      toast.error('Choose JPEG, PNG, or WebP images.');
      return;
    }
    if (galleryImageList.length + imageFiles.length > 10) {
      toast.error('Use up to 10 background images.');
      return;
    }
    setGalleryFiles(imageFiles);
    setBusy(true);
    const uploads = await Promise.all(
      imageFiles.map((file) => uploadUserMediaFile(file)),
    );
    setBusy(false);
    setGalleryFiles([]);
    const uploadedUrls = uploads.flatMap((result) =>
      result.ok ? [result.data.url] : [],
    );
    if (uploadedUrls.length > 0) {
      const nextImages = [...galleryImageList, ...uploadedUrls];
      setGalleryImages(nextImages.join('\n'));
      setGalleryMode('STATIC_SLIDESHOW');
      setDirty(true);
      toast.success(
        `${uploadedUrls.length} image${uploadedUrls.length === 1 ? '' : 's'} added to the slideshow.`,
      );
    }
    const errors = uploads.flatMap((result) =>
      result.ok ? [] : [result.error],
    );
    if (errors.length > 0) {
      toast.error(errors.join('; '));
    }
  };

  const removeGalleryImage = (index: number) => {
    const nextImages = galleryImageList.filter(
      (_, imageIndex) => imageIndex !== index,
    );
    setGalleryImages(nextImages.join('\n'));
    if (nextImages.length === 0) {
      setGalleryMode('NONE');
    }
    setDirty(true);
  };

  const reorderGalleryImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }
    const nextImages = [...galleryImageList];
    const [movedImage] = nextImages.splice(fromIndex, 1);
    nextImages.splice(toIndex, 0, movedImage);
    setGalleryImages(nextImages.join('\n'));
    setGalleryPreviewIndex(toIndex);
    setDirty(true);
  };

  const setPresetSetting = (
    preset: string,
    key: 'speed' | 'intensity' | 'audioReactive',
    value: number | boolean,
  ) => {
    const nextValue =
      typeof value === 'number' ? Math.round(value * 100) / 100 : value;
    setVisualSettings((current) => ({
      ...current,
      [preset]: {
        ...resolveVisualPresetSettings(current, preset),
        [key]: nextValue,
      },
    }));
    setDirty(true);
  };

  const setOverlaySetting = <
    SettingKey extends keyof NowPlayingOverlaySettings,
  >(
    key: SettingKey,
    value: NowPlayingOverlaySettings[SettingKey],
  ) => {
    setOverlaySettings((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    if (!visual) {
      return;
    }
    const images = galleryImages
      .split(/\r?\n/)
      .map((image) => image.trim())
      .filter(Boolean);
    if (images.length > 10) {
      toast.error('Use up to 10 gallery images.');
      return;
    }
    if (galleryMode !== 'NONE' && images.length === 0) {
      toast.error('Add at least one image for the selected gallery.');
      return;
    }
    if (images.some((image) => !/^https:\/\/\S+$/i.test(image))) {
      toast.error('Gallery images must use public HTTPS URLs.');
      return;
    }
    setBusy(true);
    let savedVideoUrl = videoBackgroundUrl.trim() || null;
    if (pendingVideoFile) {
      const upload = await uploadChannelHeaderVideo(pendingVideoFile);
      if (!upload.ok) {
        setBusy(false);
        toast.error(upload.error);
        return;
      }
      savedVideoUrl = upload.videoBackgroundUrl;
      setVideoBackgroundUrl(upload.videoBackgroundUrl);
      if (pendingVideoPreviewUrl) {
        URL.revokeObjectURL(pendingVideoPreviewUrl);
      }
      setPendingVideoFile(null);
      setPendingVideoPreviewUrl(null);
    }
    const result = await patchChannelVisual({
      visualPreset: visual.visualPreset,
      headerStyle: visual.headerStyle,
      videoBackgroundUrl: savedVideoUrl,
      brandAccentPreset: visual.brandAccentPreset,
      colorScheme: fillColorScheme(scheme),
      visualSettings,
      slideshowPreset,
      slideshowIntervalSeconds: slideshowInterval,
      slideshowTransitionMs: slideshowTransition,
      slideshowAutoplay,
      nowPlayingOverlayStyle: visual.nowPlayingOverlayStyle ?? undefined,
      nowPlayingOverlaySettingsJson: JSON.stringify(overlaySettings),
      usePlayerGradient: visual.usePlayerGradient ?? false,
      playerColorSchemeJson: visual.usePlayerGradient
        ? JSON.stringify(fillColorScheme(playerScheme))
        : null,
    });
    if (!result.ok) {
      setBusy(false);
      toast.error(result.error);
      return;
    }

    // The visual endpoint is the source of truth for the header and player
    // design. Apply it immediately so a gallery endpoint failure cannot make
    // an otherwise successful backdrop save look like it failed.
    setVisual(result.data);
    setScheme(parseColorScheme(result.data.colorSchemeJson));
    setPlayerScheme(parseColorScheme(result.data.playerColorSchemeJson));
    setVisualSettings(parseVisualSettingsMap(result.data.visualSettingsJson));
    setSlideshowPreset(result.data.slideshowPreset ?? slideshowPreset);
    setSlideshowInterval(
      result.data.slideshowIntervalSeconds ?? slideshowInterval,
    );
    setSlideshowTransition(
      result.data.slideshowTransitionMs ?? slideshowTransition,
    );
    setSlideshowAutoplay(result.data.slideshowAutoplay ?? slideshowAutoplay);
    setDirty(false);
    onSaved?.();

    const galleryResult = await patchChannelGallery({
      galleryMode,
      slideshowImages: images,
      videoBackgroundUrl: savedVideoUrl,
    });
    setBusy(false);
    if (!galleryResult.ok) {
      toast.warning(
        'Backdrop saved, but slideshow settings could not be updated.',
      );
    } else {
      toast.success('Look saved — public channel will pick this up.');
    }
  };

  if (!visual) {
    return <PageLoading label="Loading designer…" />;
  }

  // VIDEO_LOOP without a playable clip or image isn't a state worth saving —
  // the header would just render empty on the real channel page.
  const videoLoopNeedsUrl =
    visual.headerStyle === 'VIDEO_LOOP' &&
    !pendingVideoFile &&
    !isValidHeaderBackdropUrl(videoBackgroundUrl);
  const showHeaderVideo =
    visual.headerStyle === 'VIDEO_LOOP' &&
    (pendingVideoFile !== null || isValidHeaderBackdropUrl(videoBackgroundUrl));
  const previewVideoUrl = pendingVideoPreviewUrl ?? videoBackgroundUrl;
  const headerBackdropIsImage = pendingVideoFile
    ? pendingVideoFile.type.startsWith('image/')
    : isHeaderImageUrl(previewVideoUrl);
  const showGalleryBackdrop =
    galleryImageList.length > 0 && galleryMode !== 'NONE' && !showHeaderVideo;

  const availableVisualizers = VISUAL_PRESETS.filter(
    (preset) => preset !== 'MINIMAL',
  );
  const activeVisualizer: Exclude<VisualPreset, 'MINIMAL'> =
    isVisualPreset(previewPreset) && previewPreset !== 'MINIMAL'
      ? previewPreset
      : 'AURORA';
  const visualizerEnabled = visual.visualPreset !== 'MINIMAL';
  const slideshowHeaderSelected = galleryMode !== 'NONE';
  const hasBackdrop =
    pendingVideoFile !== null ||
    videoBackgroundUrl.trim().length > 0 ||
    galleryImageList.length > 0;

  const changeVisualizer = (direction: -1 | 1) => {
    const activeIndex = availableVisualizers.indexOf(activeVisualizer);
    const nextIndex =
      (activeIndex + direction + availableVisualizers.length) %
      availableVisualizers.length;
    const nextPreset = availableVisualizers[nextIndex];
    if (!nextPreset) {
      return;
    }
    setPreviewPreset(nextPreset);
    applyLocal({ visualPreset: nextPreset });
  };

  const tuningSliders = (preset: string) => (
    <>
      {(['speed', 'intensity'] as const).map((key) => {
        const current = resolveVisualPresetSettings(visualSettings, preset);
        return (
          <Slider
            key={key}
            label={key === 'speed' ? 'Speed' : 'Intensity'}
            min={0.25}
            max={2}
            step={0.05}
            unit="×"
            value={current[key]}
            onValueChange={(value) => setPresetSetting(preset, key, value)}
          />
        );
      })}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={
            resolveVisualPresetSettings(visualSettings, preset).audioReactive
          }
          onChange={(event) =>
            setPresetSetting(preset, 'audioReactive', event.target.checked)
          }
        />
        Audio reactive
      </label>
    </>
  );

  // Only the full (non-lookOnly) chrome, with a live preview allowed, ever
  // gets a real preview to dock tuning into.
  const hasLivePreview = !lookOnly && livePreview;

  const dockTuning =
    shouldDockVisualizerTuning({
      preset: previewPreset,
      visualizerEnabled,
      activeTab,
    }) &&
    showVisualizerSettings &&
    !visualizerPickerOpen;

  const colorSchemeControls = (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
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
      <ColorSchemeFields
        scheme={scheme}
        onChange={(next) => applyLocal({}, next)}
      />
    </section>
  );

  const playerGradientControls = (
    <section className="flex flex-col gap-4">
      <label className="border-border bg-background-secondary/40 flex items-start gap-3 rounded-lg border p-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={visual.usePlayerGradient ?? false}
          onChange={(event) => {
            const usePlayerGradient = event.target.checked;
            if (usePlayerGradient && !visual.playerColorSchemeJson) {
              setPlayerScheme(scheme);
            }
            applyLocal({ usePlayerGradient });
          }}
        />
        <span>
          <span className="block font-semibold">
            Use a separate gradient for the player
          </span>
          <span className="text-foreground-secondary block text-xs">
            Off by default — the player reuses the gradient set above for the
            channel header.
          </span>
        </span>
      </label>
      {visual.usePlayerGradient ? (
        <ColorSchemeFields
          scheme={playerScheme}
          onChange={(next) => {
            setPlayerScheme(next);
            setDirty(true);
          }}
        />
      ) : (
        <p className="text-foreground-secondary text-xs">
          The player currently matches the channel header's gradient, set in
          Backdrop design.
        </p>
      )}
    </section>
  );

  const slideshowControls = (
    <section className="flex flex-col gap-4">
      <FilePicker
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={busy}
        selectedFiles={galleryFiles}
        icon={<ImageIcon size={20} aria-hidden />}
        labels={{
          title: 'Drop slideshow images here',
          description: 'JPEG, PNG, or WebP · up to 10 images',
          browse: 'Browse images',
        }}
        onFiles={selectGalleryFiles}
      />
      {galleryImageList.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>
              {galleryImageList.length === 1
                ? 'Single image preview'
                : `Slideshow · ${galleryImageList.length} images`}
            </Eyebrow>
            <span className="text-foreground-secondary text-xs">
              {galleryPreviewIndex + 1} / {galleryImageList.length}
            </span>
          </div>
          <div className="border-border bg-background relative h-36 overflow-hidden rounded-lg border">
            <img
              src={galleryImageList[galleryPreviewIndex]}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {galleryImageList.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="group relative"
                draggable
                onDragStart={() => setDraggedGalleryIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedGalleryIndex !== null) {
                    reorderGalleryImage(draggedGalleryIndex, index);
                  }
                  setDraggedGalleryIndex(null);
                }}
                onDragEnd={() => setDraggedGalleryIndex(null)}
              >
                <button
                  type="button"
                  className={`border-border h-16 w-full overflow-hidden rounded-md border ${index === galleryPreviewIndex ? 'border-primary ring-primary ring-2' : ''}`}
                  aria-label={`Preview slideshow image ${index + 1}`}
                  aria-pressed={index === galleryPreviewIndex}
                  onClick={() => setGalleryPreviewIndex(index)}
                >
                  <img src={image} alt="" className="size-full object-cover" />
                </button>
                <Button
                  size="icon-sm"
                  variant="secondary"
                  className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={`Remove slideshow image ${index + 1}`}
                  title="Remove image"
                  onClick={() => removeGalleryImage(index)}
                >
                  <Trash2Icon size={14} aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-foreground-secondary text-xs">
          Upload images to build the slideshow behind your channel.
        </p>
      )}
      <Select
        label="Gallery style"
        value={galleryMode}
        onValueChange={(value) => {
          setGalleryMode(value as ChannelGalleryMode);
          setDirty(true);
        }}
        options={GALLERY_MODES.map((mode) => ({
          id: mode.id,
          label: mode.label,
        }))}
      />
      {galleryImageList.length > 1 ? (
        <>
          <Select
            label="Transition"
            value={slideshowPreset}
            onValueChange={(value) => {
              setSlideshowPreset(value);
              setDirty(true);
            }}
            options={SLIDESHOW_PRESETS.map(([id, label]) => ({ id, label }))}
          />
          <Slider
            label={`Interval: ${slideshowInterval}s`}
            min={5}
            max={30}
            step={1}
            value={slideshowInterval}
            onValueChange={(value) => {
              setSlideshowInterval(value);
              setDirty(true);
            }}
          />
          <Slider
            label={`Transition speed: ${slideshowTransition}ms`}
            min={300}
            max={1500}
            step={100}
            value={slideshowTransition}
            onValueChange={(value) => {
              setSlideshowTransition(value);
              setDirty(true);
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={slideshowAutoplay}
              onChange={(event) => {
                setSlideshowAutoplay(event.target.checked);
                setDirty(true);
              }}
            />
            Automatically advance slides
          </label>
        </>
      ) : null}
    </section>
  );

  const videoUrlInput = videoUrlOpen ? (
    <Input
      label="YouTube, video, or image URL"
      value={videoBackgroundUrl}
      placeholder="https://youtube.com/watch?v=… or https://…/backdrop.jpg"
      onChange={(event) => {
        setVideoBackgroundUrl(event.target.value);
        setPendingVideoFile(null);
        setPendingVideoPreviewUrl(null);
        setDirty(true);
      }}
    />
  ) : null;

  const videoUrlToggle = (
    <Button
      size="icon-sm"
      variant="text"
      aria-label="Show URL field"
      title="Use a video or image URL"
      aria-pressed={videoUrlOpen}
      onClick={() => setVideoUrlOpen((open) => !open)}
    >
      <LinkIcon size={15} aria-hidden />
    </Button>
  );

  const visualizerItem = {
    id: 'visualizer',
    label: (
      <span className="inline-flex items-center gap-1.5">
        <PlaySquareIcon size={14} aria-hidden /> Visualizer
      </span>
    ),
    content: (
      <section className="flex flex-col gap-4">
        {(() => {
          const meta = visualizerMetadata(activeVisualizer);
          return (
            <PluginItem
              icon={
                <button
                  type="button"
                  className="hover:bg-background-secondary flex size-full items-center justify-center rounded-lg transition-colors"
                  aria-label="Choose visualizer"
                  title="Choose visualizer"
                  onClick={() => {
                    setVisualizerPickerPreset(activeVisualizer);
                    setVisualizerPickerOpen(true);
                  }}
                >
                  <meta.Icon size={22} aria-hidden />
                </button>
              }
              name={
                <span className="text-base">
                  {activeVisualizer.replace(/_/g, ' ')}
                </span>
              }
              description={meta.description}
              descriptionBelow
              className={`ring-primary bg-primary/10 ring-2 ring-inset ${
                !visualizerEnabled ? 'opacity-50 grayscale' : ''
              }`}
              rightAccessory={
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="text"
                    disabled={!visualizerEnabled}
                    onClick={() => changeVisualizer(-1)}
                    aria-label="Previous visualizer"
                    title="Previous visualizer"
                  >
                    <ChevronLeftIcon size={16} aria-hidden />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="text"
                    disabled={!visualizerEnabled}
                    onClick={() => changeVisualizer(1)}
                    aria-label="Next visualizer"
                    title="Next visualizer"
                  >
                    <ChevronRightIcon size={16} aria-hidden />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant={showVisualizerSettings ? 'default' : 'text'}
                    disabled={!visualizerEnabled}
                    aria-pressed={showVisualizerSettings}
                    aria-label={`Configure ${activeVisualizer.replace(/_/g, ' ')}`}
                    title={`Configure ${activeVisualizer.replace(/_/g, ' ')}`}
                    onClick={() =>
                      setShowVisualizerSettings((isVisible) => !isVisible)
                    }
                  >
                    <SettingsIcon size={15} aria-hidden />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant={visualizerEnabled ? 'default' : 'secondary'}
                    aria-pressed={visualizerEnabled}
                    aria-label={
                      visualizerEnabled
                        ? 'Disable visualizer'
                        : 'Enable visualizer'
                    }
                    title={
                      visualizerEnabled
                        ? 'Disable visualizer'
                        : 'Enable visualizer'
                    }
                    onClick={() => {
                      if (visualizerEnabled) {
                        setPreviewPreset('MINIMAL');
                        applyLocal({ visualPreset: 'MINIMAL' });
                      } else {
                        setPreviewPreset(activeVisualizer);
                        applyLocal({ visualPreset: activeVisualizer });
                      }
                    }}
                  >
                    {visualizerEnabled ? (
                      <CheckIcon size={15} aria-hidden />
                    ) : (
                      <PlaySquareIcon size={15} aria-hidden />
                    )}
                  </Button>
                </div>
              }
            />
          );
        })()}
        {dockTuning && (
          <div className="border-border flex flex-col gap-4 rounded-lg border p-3">
            <Eyebrow>Tune {visual.visualPreset.replace(/_/g, ' ')}</Eyebrow>
            {tuningSliders(visual.visualPreset)}
          </div>
        )}
      </section>
    ),
  };

  const headerControls = (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>Header style</Eyebrow>
        {hasBackdrop ? (
          <Button
            size="icon-sm"
            variant="text"
            aria-label="Remove backdrop"
            title="Remove backdrop"
            onClick={removeBackdrop}
          >
            <Trash2Icon size={15} aria-hidden />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setGalleryMode('NONE');
              applyLocal({ headerStyle: 'VIDEO_LOOP' });
            }}
          >
            Add backdrop
          </Button>
        )}
      </div>
      <Tabs
        selectedIndex={
          slideshowHeaderSelected
            ? HEADER_DESIGN_OPTIONS.length - 1
            : Math.max(
                HEADER_DESIGN_OPTIONS.indexOf(
                  visual.headerStyle as (typeof HEADER_DESIGN_OPTIONS)[number],
                ),
                0,
              )
        }
        onChange={(index) => {
          const headerStyle = HEADER_DESIGN_OPTIONS[index];
          if (headerStyle === 'SLIDESHOW') {
            setGalleryMode((mode) =>
              mode === 'NONE' ? 'STATIC_SLIDESHOW' : mode,
            );
            applyLocal({ headerStyle: 'GRADIENT' });
          } else if (headerStyle) {
            setGalleryMode('NONE');
            applyLocal({ headerStyle });
          }
        }}
        listClassName="flex-wrap border-border border-b"
        panelClassName="hidden"
        items={HEADER_DESIGN_OPTIONS.map((headerStyle) => ({
          id: headerStyle,
          label:
            headerStyle === 'SLIDESHOW'
              ? 'Slideshow'
              : headerStyle === 'VIDEO_LOOP'
                ? 'Video / image'
                : headerStyle.replace(/_/g, ' '),
          content: null,
        }))}
      />
      {visual.headerStyle === 'GRADIENT' && !slideshowHeaderSelected ? (
        <div className="border-border border-t pt-4">
          <Eyebrow>Gradient colors</Eyebrow>
          <div className="mt-3">{colorSchemeControls}</div>
        </div>
      ) : null}
      {slideshowHeaderSelected ? (
        <div className="border-border border-t pt-4">
          <Eyebrow>Slideshow</Eyebrow>
          <div className="mt-3">{slideshowControls}</div>
        </div>
      ) : null}
      {visual.headerStyle === 'SOLID' && !slideshowHeaderSelected ? (
        <label className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3 text-sm">
          <input
            type="color"
            value={scheme.bg ?? DEFAULT_COLOR_SCHEME.bg}
            onChange={(event) =>
              applyLocal({}, { ...scheme, bg: event.target.value })
            }
            className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent"
            aria-label="Solid header color"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              Solid header color
            </span>
            <code className="text-foreground-secondary text-xs">
              {scheme.bg ?? DEFAULT_COLOR_SCHEME.bg}
            </code>
          </span>
        </label>
      ) : null}
      {visual.headerStyle === 'VIDEO_LOOP' && !slideshowHeaderSelected ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Eyebrow>Video or image backdrop</Eyebrow>
              <p className="text-foreground-secondary mt-1 text-xs">
                Upload an MP4/WebM video or image, up to 10 MB.
              </p>
            </div>
          </div>
          <div className="relative">
            <FilePicker
              accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/gif"
              disabled={busy}
              selectedFiles={pendingVideoFile ? [pendingVideoFile] : []}
              labels={{
                title: 'Choose a video or image',
                description:
                  'MP4, WebM, JPEG, PNG, WebP, or GIF · maximum 10 MB',
                browse: 'Browse files',
              }}
              onFiles={selectVideoFile}
            />
            <div className="absolute top-2 right-2">{videoUrlToggle}</div>
          </div>
          {videoUrlInput}
          {(pendingVideoPreviewUrl || videoBackgroundUrl) && (
            <div className="border-border bg-background relative overflow-hidden rounded-lg border">
              {youtubeEmbedUrl(videoBackgroundUrl) &&
              !pendingVideoPreviewUrl ? (
                <iframe
                  title="YouTube backdrop preview"
                  src={youtubeEmbedUrl(videoBackgroundUrl) ?? undefined}
                  className="pointer-events-none aspect-video w-full"
                  allow="autoplay; encrypted-media"
                />
              ) : headerBackdropIsImage ? (
                <img
                  src={pendingVideoPreviewUrl ?? videoBackgroundUrl}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <video
                  src={pendingVideoPreviewUrl ?? videoBackgroundUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  controls
                  className="aspect-video w-full object-cover"
                />
              )}
            </div>
          )}
          {(pendingVideoFile || videoBackgroundUrl) && (
            <Button
              size="sm"
              variant="secondary"
              className="self-start"
              onClick={clearVideo}
            >
              Remove backdrop
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );

  const saveButton = (
    <SaveButton
      disabled={!dirty || videoLoopNeedsUrl}
      saving={busy}
      label={lookOnly ? 'Save look' : 'Save layout'}
      savingLabel={lookOnly ? 'Saving look…' : 'Saving layout…'}
      onClick={() => void save()}
    />
  );

  const controls = (
    <div className="flex flex-col gap-3">
      <div
        id="channel-designer-section-player"
        className={`order-2 rounded-xl transition-shadow ${
          highlightSection === 'visualizer' ? 'ring-primary ring-2' : ''
        }`}
      >
        <ChannelControlsWidget
          openId={openSectionId}
          onOpenChange={handleOpenSectionChange}
          sections={[
            {
              id: 'player-design',
              title: 'Player design',
              children: (
                <Tabs
                  listClassName="flex-wrap border-border border-b pb-3"
                  panelClassName="pt-2"
                  selectedIndex={
                    playerDesignTab === 'gradient'
                      ? 0
                      : playerDesignTab === 'video-image'
                        ? 1
                        : 2
                  }
                  onChange={(index) => {
                    const nextTab: PlayerDesignTab =
                      index === 0
                        ? 'gradient'
                        : index === 1
                          ? 'video-image'
                          : 'visualizer';
                    setPlayerDesignTab(nextTab);
                  }}
                  items={[
                    {
                      id: 'gradient',
                      label: 'Gradient',
                      content: playerGradientControls,
                    },
                    {
                      id: 'video-image',
                      label: 'Video / image',
                      content: (
                        <div className="flex flex-col gap-3">
                          <p className="text-foreground-secondary text-xs">
                            Use a looping video or still image behind the
                            channel header.
                          </p>
                          <div className="relative">
                            <FilePicker
                              accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/gif"
                              disabled={busy}
                              selectedFiles={
                                pendingVideoFile ? [pendingVideoFile] : []
                              }
                              labels={{
                                title: 'Choose a video or image',
                                description:
                                  'MP4, WebM, JPEG, PNG, WebP, or GIF · maximum 10 MB',
                                browse: 'Browse files',
                              }}
                              onFiles={selectVideoFile}
                            />
                            <div className="absolute top-2 right-2">
                              {videoUrlToggle}
                            </div>
                          </div>
                          {videoUrlInput}
                        </div>
                      ),
                    },
                    visualizerItem,
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
      <div
        id="channel-designer-section-header"
        className={`order-1 rounded-xl transition-shadow ${
          highlightSection === 'header' ? 'ring-primary ring-2' : ''
        }`}
      >
        <ChannelControlsWidget
          openId={openSectionId}
          onOpenChange={handleOpenSectionChange}
          sections={[
            {
              id: 'visual-style',
              title: 'Backdrop design',
              children: (
                <>
                  {headerControls}
                  <div className="hidden" aria-hidden="true">
                    <Tabs
                      listClassName="flex-wrap border-border border-b pb-3"
                      panelClassName="pt-2"
                      selectedIndex={
                        slideshowHeaderSelected ||
                        visual.headerStyle === 'GRADIENT'
                          ? 0
                          : activeTab === 'header'
                            ? 1
                            : 0
                      }
                      onChange={(index) => {
                        if (
                          slideshowHeaderSelected ||
                          visual.headerStyle === 'GRADIENT'
                        ) {
                          setActiveTab('header');
                        } else {
                          setActiveTab(index === 1 ? 'header' : 'color-scheme');
                        }
                      }}
                      items={[
                        {
                          id: 'visualizer',
                          label: (
                            <span className="inline-flex items-center gap-1.5">
                              <PlaySquareIcon size={14} aria-hidden />{' '}
                              Visualizer
                            </span>
                          ),
                          content: (
                            <section className="flex flex-col gap-4">
                              {(() => {
                                const meta =
                                  visualizerMetadata(activeVisualizer);
                                return (
                                  <PluginItem
                                    icon={
                                      <button
                                        type="button"
                                        className="hover:bg-background-secondary flex size-full items-center justify-center rounded-lg transition-colors"
                                        aria-label="Choose visualizer"
                                        title="Choose visualizer"
                                        onClick={() => {
                                          setVisualizerPickerPreset(
                                            activeVisualizer,
                                          );
                                          setVisualizerPickerOpen(true);
                                        }}
                                      >
                                        <meta.Icon size={22} aria-hidden />
                                      </button>
                                    }
                                    name={
                                      <span className="text-base">
                                        {activeVisualizer.replace(/_/g, ' ')}
                                      </span>
                                    }
                                    description={meta.description}
                                    descriptionBelow
                                    className={`ring-primary bg-primary/10 ring-2 ring-inset ${
                                      !visualizerEnabled
                                        ? 'opacity-50 grayscale'
                                        : ''
                                    }`}
                                    rightAccessory={
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon-sm"
                                          variant="text"
                                          disabled={!visualizerEnabled}
                                          onClick={() => changeVisualizer(-1)}
                                          aria-label="Previous visualizer"
                                          title="Previous visualizer"
                                        >
                                          <ChevronLeftIcon
                                            size={16}
                                            aria-hidden
                                          />
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant="text"
                                          disabled={!visualizerEnabled}
                                          onClick={() => changeVisualizer(1)}
                                          aria-label="Next visualizer"
                                          title="Next visualizer"
                                        >
                                          <ChevronRightIcon
                                            size={16}
                                            aria-hidden
                                          />
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant={
                                            showVisualizerSettings
                                              ? 'default'
                                              : 'text'
                                          }
                                          disabled={!visualizerEnabled}
                                          aria-pressed={showVisualizerSettings}
                                          aria-label={`Configure ${activeVisualizer.replace(/_/g, ' ')}`}
                                          title={`Configure ${activeVisualizer.replace(/_/g, ' ')}`}
                                          onClick={() =>
                                            setShowVisualizerSettings(
                                              (isVisible) => !isVisible,
                                            )
                                          }
                                        >
                                          <SettingsIcon size={15} aria-hidden />
                                        </Button>
                                        <Button
                                          size="icon-sm"
                                          variant={
                                            visualizerEnabled
                                              ? 'default'
                                              : 'secondary'
                                          }
                                          aria-pressed={visualizerEnabled}
                                          aria-label={
                                            visualizerEnabled
                                              ? 'Disable visualizer'
                                              : 'Enable visualizer'
                                          }
                                          title={
                                            visualizerEnabled
                                              ? 'Disable visualizer'
                                              : 'Enable visualizer'
                                          }
                                          onClick={() => {
                                            if (visualizerEnabled) {
                                              setPreviewPreset('MINIMAL');
                                              applyLocal({
                                                visualPreset: 'MINIMAL',
                                              });
                                            } else {
                                              setPreviewPreset(
                                                activeVisualizer,
                                              );
                                              applyLocal({
                                                visualPreset: activeVisualizer,
                                              });
                                            }
                                          }}
                                        >
                                          {visualizerEnabled ? (
                                            <CheckIcon size={15} aria-hidden />
                                          ) : (
                                            <PlaySquareIcon
                                              size={15}
                                              aria-hidden
                                            />
                                          )}
                                        </Button>
                                      </div>
                                    }
                                  />
                                );
                              })()}
                              {/* Tuning always sits directly under the preset
                    picker, in this same card — never in the separate
                    preview card above, so switching/tuning a preset and
                    confirming it via Save all happen in one place. */}
                              {dockTuning && (
                                <div className="border-border flex flex-col gap-4 rounded-lg border p-3">
                                  <Eyebrow>
                                    Tune{' '}
                                    {visual.visualPreset.replace(/_/g, ' ')}
                                  </Eyebrow>
                                  {tuningSliders(visual.visualPreset)}
                                </div>
                              )}
                            </section>
                          ),
                        },
                        {
                          id: 'color-scheme',
                          label: (
                            <span className="inline-flex items-center gap-1.5">
                              <PaletteIcon size={14} aria-hidden /> Color scheme
                            </span>
                          ),
                          content:
                            visual.headerStyle === 'GRADIENT' ? (
                              <p className="text-foreground-secondary text-sm">
                                Color controls are available under Header while
                                the gradient header is selected.
                              </p>
                            ) : (
                              colorSchemeControls
                            ),
                        },
                        {
                          id: 'header',
                          label: (
                            <span className="inline-flex items-center gap-1.5">
                              <TypeIcon size={14} aria-hidden /> Header
                            </span>
                          ),
                          content: (
                            <section className="flex flex-col gap-3">
                              <Eyebrow>Header style</Eyebrow>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {HEADER_DESIGN_OPTIONS.map((headerStyle) => {
                                  const active =
                                    headerStyle === 'SLIDESHOW'
                                      ? slideshowHeaderSelected
                                      : !slideshowHeaderSelected &&
                                        visual.headerStyle === headerStyle;
                                  return (
                                    <button
                                      key={headerStyle}
                                      type="button"
                                      aria-pressed={active}
                                      onClick={() => {
                                        if (headerStyle === 'SLIDESHOW') {
                                          setGalleryMode((mode) =>
                                            mode === 'NONE'
                                              ? 'STATIC_SLIDESHOW'
                                              : mode,
                                          );
                                          applyLocal({
                                            headerStyle: 'GRADIENT',
                                          });
                                        } else {
                                          setGalleryMode('NONE');
                                          applyLocal({ headerStyle });
                                        }
                                        setActiveTab('header');
                                      }}
                                      className={`rounded-lg border p-4 text-left text-sm font-semibold tracking-wide uppercase transition-colors ${
                                        active
                                          ? 'border-primary bg-primary/10 ring-primary ring-1'
                                          : 'border-border bg-background hover:bg-background-secondary text-foreground-secondary hover:text-foreground'
                                      }`}
                                    >
                                      {headerStyle === 'SLIDESHOW'
                                        ? 'SLIDESHOW'
                                        : headerStyle === 'VIDEO_LOOP'
                                          ? 'VIDEO / IMAGE'
                                          : headerStyle.replace(/_/g, ' ')}
                                    </button>
                                  );
                                })}
                              </div>
                              {visual.headerStyle === 'GRADIENT' &&
                                !slideshowHeaderSelected && (
                                  <div className="border-border border-t pt-4">
                                    <Eyebrow>Gradient colors</Eyebrow>
                                    <div className="mt-3">
                                      {colorSchemeControls}
                                    </div>
                                  </div>
                                )}
                              {slideshowHeaderSelected && (
                                <div className="border-border border-t pt-4">
                                  <Eyebrow>Slideshow</Eyebrow>
                                  <div className="mt-3">
                                    {slideshowControls}
                                  </div>
                                </div>
                              )}
                              {visual.headerStyle === 'SOLID' && (
                                <label className="border-border bg-background-secondary/40 flex items-center gap-3 rounded-lg border p-3 text-sm">
                                  <input
                                    type="color"
                                    value={scheme.bg ?? DEFAULT_COLOR_SCHEME.bg}
                                    onChange={(event) =>
                                      applyLocal(
                                        {},
                                        {
                                          ...scheme,
                                          bg: event.target.value,
                                        },
                                      )
                                    }
                                    className="h-9 w-11 cursor-pointer rounded border-0 bg-transparent"
                                    aria-label="Solid header color"
                                  />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                      Solid header color
                                    </span>
                                    <code className="text-foreground-secondary text-xs">
                                      {scheme.bg ?? DEFAULT_COLOR_SCHEME.bg}
                                    </code>
                                  </span>
                                </label>
                              )}
                              {visual.headerStyle === 'VIDEO_LOOP' &&
                                (() => {
                                  const previewIsImage = pendingVideoFile
                                    ? pendingVideoFile.type.startsWith('image/')
                                    : isHeaderImageUrl(videoBackgroundUrl);
                                  return (
                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <div>
                                          <Eyebrow>
                                            Video or image backdrop
                                          </Eyebrow>
                                          <p className="text-foreground-secondary mt-1 text-xs">
                                            Upload an MP4/WebM video or a
                                            JPEG/PNG/WebP/GIF image, up to 10
                                            MB. A video loops muted; an image is
                                            shown static — either sits behind
                                            your channel header and is stored in
                                            your private R2 storage.
                                          </p>
                                        </div>
                                      </div>
                                      <div className="relative">
                                        <FilePicker
                                          accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/gif"
                                          disabled={busy}
                                          selectedFiles={
                                            pendingVideoFile
                                              ? [pendingVideoFile]
                                              : []
                                          }
                                          labels={{
                                            title: 'Choose a video or image',
                                            description:
                                              'MP4, WebM, JPEG, PNG, WebP, or GIF · maximum 10 MB',
                                            browse: 'Browse files',
                                          }}
                                          onFiles={selectVideoFile}
                                        />
                                        <div className="absolute top-2 right-2">
                                          {videoUrlToggle}
                                        </div>
                                      </div>
                                      {videoUrlInput}
                                      {(pendingVideoPreviewUrl ||
                                        videoBackgroundUrl) && (
                                        <div className="border-border bg-background relative overflow-hidden rounded-lg border">
                                          {youtubeEmbedUrl(
                                            videoBackgroundUrl,
                                          ) && !pendingVideoPreviewUrl ? (
                                            <iframe
                                              title="YouTube backdrop preview"
                                              src={
                                                youtubeEmbedUrl(
                                                  videoBackgroundUrl,
                                                ) ?? undefined
                                              }
                                              className="pointer-events-none aspect-video max-h-64 w-full"
                                              allow="autoplay; encrypted-media"
                                            />
                                          ) : previewIsImage ? (
                                            <img
                                              key={
                                                pendingVideoPreviewUrl ??
                                                videoBackgroundUrl
                                              }
                                              src={
                                                pendingVideoPreviewUrl ??
                                                videoBackgroundUrl
                                              }
                                              alt=""
                                              className="aspect-video max-h-64 w-full object-cover"
                                            />
                                          ) : (
                                            <video
                                              key={
                                                pendingVideoPreviewUrl ??
                                                videoBackgroundUrl
                                              }
                                              src={
                                                pendingVideoPreviewUrl ??
                                                videoBackgroundUrl
                                              }
                                              muted
                                              loop
                                              autoPlay
                                              playsInline
                                              controls
                                              className="aspect-video max-h-64 w-full object-cover"
                                            />
                                          )}
                                          <div className="bg-background/85 text-foreground-secondary absolute inset-x-0 bottom-0 px-3 py-2 text-xs backdrop-blur-sm">
                                            {pendingVideoFile
                                              ? 'Preview — save your channel design to approve and upload it.'
                                              : 'Current uploaded backdrop'}
                                          </div>
                                        </div>
                                      )}
                                      {(pendingVideoFile ||
                                        videoBackgroundUrl) && (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="self-start"
                                          onClick={clearVideo}
                                        >
                                          Remove backdrop
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })()}
                            </section>
                          ),
                        },
                        {
                          id: 'slideshow',
                          label: (
                            <span className="inline-flex items-center gap-1.5">
                              <ImagesIcon size={14} aria-hidden /> Slideshow
                            </span>
                          ),
                          content: (
                            <section className="flex flex-col gap-4">
                              <FilePicker
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                disabled={busy}
                                selectedFiles={galleryFiles}
                                icon={<ImageIcon size={20} aria-hidden />}
                                labels={{
                                  title: 'Drop slideshow images here',
                                  description:
                                    'JPEG, PNG, or WebP · up to 10 images',
                                  browse: 'Browse images',
                                }}
                                onFiles={selectGalleryFiles}
                              />
                              {galleryImageList.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <Eyebrow>
                                      {galleryImageList.length === 1
                                        ? 'Single image preview'
                                        : `Slideshow · ${galleryImageList.length} images`}
                                    </Eyebrow>
                                    <span className="text-foreground-secondary text-xs">
                                      {galleryPreviewIndex + 1} /{' '}
                                      {galleryImageList.length}
                                    </span>
                                  </div>
                                  <div className="border-border bg-background relative h-36 overflow-hidden rounded-lg border">
                                    <img
                                      key={
                                        galleryImageList[galleryPreviewIndex]
                                      }
                                      src={
                                        galleryImageList[galleryPreviewIndex]
                                      }
                                      alt=""
                                      className="h-full w-full object-cover transition-all duration-700"
                                    />
                                    <div className="bg-background/80 text-foreground-secondary absolute inset-x-0 bottom-0 px-3 py-2 text-xs backdrop-blur-sm">
                                      {galleryImageList.length === 1
                                        ? 'Preview of the image used behind the artist channel.'
                                        : `Automatic ${slideshowPreset.toLowerCase()} slideshow preview.`}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                    {galleryImageList.map((image, index) => (
                                      <div
                                        key={`${image}-${index}`}
                                        className="group relative"
                                        draggable
                                        onDragStart={() =>
                                          setDraggedGalleryIndex(index)
                                        }
                                        onDragOver={(event) =>
                                          event.preventDefault()
                                        }
                                        onDrop={() => {
                                          if (draggedGalleryIndex !== null) {
                                            reorderGalleryImage(
                                              draggedGalleryIndex,
                                              index,
                                            );
                                          }
                                          setDraggedGalleryIndex(null);
                                        }}
                                        onDragEnd={() =>
                                          setDraggedGalleryIndex(null)
                                        }
                                      >
                                        <button
                                          type="button"
                                          className={`border-border h-16 w-full overflow-hidden rounded-md border ${index === galleryPreviewIndex ? 'border-primary ring-primary ring-2' : ''}`}
                                          aria-label={`Preview slideshow image ${index + 1}`}
                                          aria-pressed={
                                            index === galleryPreviewIndex
                                          }
                                          onClick={() =>
                                            setGalleryPreviewIndex(index)
                                          }
                                        >
                                          <img
                                            src={image}
                                            alt=""
                                            className="h-full w-full object-cover"
                                          />
                                        </button>
                                        <Button
                                          size="icon-sm"
                                          variant="secondary"
                                          className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                          aria-label={`Remove slideshow image ${index + 1}`}
                                          title="Remove image"
                                          onClick={() =>
                                            removeGalleryImage(index)
                                          }
                                        >
                                          <Trash2Icon size={14} aria-hidden />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-foreground-secondary text-xs">
                                  Upload images to build the slideshow behind
                                  your channel.
                                </p>
                              )}
                              <Select
                                label="Gallery style"
                                value={galleryMode}
                                onValueChange={(value) => {
                                  setGalleryMode(value as ChannelGalleryMode);
                                  setDirty(true);
                                }}
                                options={GALLERY_MODES.map((mode) => ({
                                  id: mode.id,
                                  label: mode.label,
                                }))}
                              />
                              <p className="text-foreground-secondary text-xs">
                                Video backdrops are managed in Header → Video
                                loop. Uploaded images use your artist media
                                storage and can also be reused in your public
                                gallery.
                              </p>
                              {galleryImageList.length === 1 ? (
                                <div className="border-border flex flex-col gap-2 rounded-lg border p-3">
                                  <Eyebrow>Single image effect</Eyebrow>
                                  <p className="text-foreground-secondary text-xs">
                                    Try an effect designed for one persistent
                                    artist backdrop.
                                  </p>
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {GALLERY_MODES.filter(
                                      (mode) => mode.id !== 'STATIC_SLIDESHOW',
                                    ).map((mode) => {
                                      const active = galleryMode === mode.id;
                                      return (
                                        <button
                                          key={mode.id}
                                          type="button"
                                          aria-pressed={active}
                                          onClick={() => {
                                            setGalleryMode(mode.id);
                                            setDirty(true);
                                          }}
                                          className={`border-border rounded-md border px-3 py-2 text-left text-xs font-semibold ${active ? 'border-primary bg-primary/10' : 'hover:border-primary/50'}`}
                                        >
                                          {mode.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : null}
                              {galleryImageList.length > 1 ? (
                                <div className="flex flex-col gap-4">
                                  <Select
                                    label="Transition"
                                    value={slideshowPreset}
                                    onValueChange={(value) => {
                                      setSlideshowPreset(value);
                                      setDirty(true);
                                    }}
                                    options={SLIDESHOW_PRESETS.map(
                                      ([id, label]) => ({ id, label }),
                                    )}
                                  />
                                  <Slider
                                    label={`Interval: ${slideshowInterval}s`}
                                    min={5}
                                    max={30}
                                    step={1}
                                    value={slideshowInterval}
                                    onValueChange={(value) => {
                                      setSlideshowInterval(value);
                                      setDirty(true);
                                    }}
                                  />
                                  <Slider
                                    label={`Transition speed: ${slideshowTransition}ms`}
                                    min={300}
                                    max={1500}
                                    step={100}
                                    value={slideshowTransition}
                                    onValueChange={(value) => {
                                      setSlideshowTransition(value);
                                      setDirty(true);
                                    }}
                                  />
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={slideshowAutoplay}
                                      onChange={(event) => {
                                        setSlideshowAutoplay(
                                          event.target.checked,
                                        );
                                        setDirty(true);
                                      }}
                                    />
                                    Automatically advance slides
                                  </label>
                                </div>
                              ) : null}
                            </section>
                          ),
                        },
                      ].filter((item) => {
                        if (
                          item.id === 'visualizer' ||
                          item.id === 'slideshow'
                        ) {
                          return false;
                        }
                        return !(
                          item.id === 'color-scheme' &&
                          (visual.headerStyle === 'GRADIENT' ||
                            slideshowHeaderSelected)
                        );
                      })}
                    />
                  </div>
                </>
              ),
            },
          ]}
        />
      </div>
      <div id="channel-designer-section-now-playing" className="order-3">
        <ChannelControlsWidget
          openId={openSectionId}
          onOpenChange={handleOpenSectionChange}
          sections={[
            {
              id: 'now-playing',
              title: 'Now playing overlay',
              description:
                'How the title and artist are presented over whatever this channel is playing — live or an archive track.',
              children: (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-foreground-secondary text-xs">
                      Choose a layout, then fine-tune its scale and position.
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setOverlayConfigOpen(true)}
                    >
                      <SettingsIcon size={14} aria-hidden />
                      Configure text
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {NOW_PLAYING_OVERLAY_PRESETS.map((preset) => {
                      const active =
                        resolveNowPlayingOverlayPreset(
                          visual.nowPlayingOverlayStyle,
                        ) === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            applyLocal({ nowPlayingOverlayStyle: preset.id })
                          }
                          className={`flex flex-col gap-2 rounded-lg border p-2 text-left transition-colors ${
                            active
                              ? 'border-primary bg-primary/10 ring-primary ring-1'
                              : 'border-border bg-background hover:bg-background-secondary'
                          }`}
                        >
                          <div
                            className="relative flex aspect-video items-end overflow-hidden rounded-md bg-cover bg-center p-2"
                            style={{
                              backgroundColor: '#0B1220',
                              backgroundImage: avatarUrl
                                ? `url(${avatarUrl})`
                                : undefined,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                            <div className="relative w-full">
                              <NowPlayingOverlay
                                presetId={preset.id}
                                title="Sample Track"
                                artist={displayName}
                                artworkUrl={avatarUrl}
                                compact
                                settings={overlaySettings}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-sm font-semibold">
                              {preset.name}
                              {active && (
                                <CheckIcon
                                  size={14}
                                  className="text-primary"
                                  aria-hidden
                                />
                              )}
                            </div>
                            <p className="text-foreground-secondary text-xs">
                              {preset.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {lookOnly ? (
        <div className="border-border flex flex-wrap items-center gap-3 border-t pt-4">
          {saveButton}
        </div>
      ) : null}
    </div>
  );

  if (lookOnly) {
    return <div className="flex flex-col gap-3">{controls}</div>;
  }

  return (
    <div className={`flex flex-col gap-4 ${compact ? '' : 'w-full'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Channel Designer
        </h2>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {saveButton}
          {channelSlug ? (
            <Link
              to="/channel/$slug"
              params={{ slug: channelSlug }}
              className="text-primary text-sm font-semibold underline-offset-2 hover:underline"
            >
              Open my channel →
            </Link>
          ) : (
            <Link
              to="/u/$username"
              params={{ username }}
              className="text-primary text-sm font-semibold underline-offset-2 hover:underline"
            >
              Open my channel →
            </Link>
          )}
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(17rem,23rem)]">
        <main
          aria-label="Channel page preview"
          className="border-border bg-background min-w-0 overflow-hidden rounded-xl border shadow-lg"
        >
          <div className="border-border bg-background-secondary/40 flex items-center gap-1.5 border-b px-4 py-2.5">
            <span className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
              Live page preview
            </span>
            <Tooltip
              side="bottom"
              content={
                <p className="max-w-64 text-xs leading-relaxed">
                  This mirrors the public channel structure. Visitors see your
                  profile header, channel navigation, live stage, tracks, and
                  artist information in this order. Layout blocks are edited
                  from the channel page editor.
                </p>
              }
            >
              <span
                tabIndex={0}
                aria-label="About this preview"
                className="text-foreground-secondary hover:text-foreground inline-flex size-4 cursor-help items-center justify-center rounded-full border border-current"
              >
                <span className="text-[10px] leading-none font-bold">?</span>
              </span>
            </Tooltip>
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Edit backdrop design"
            title="Edit backdrop design"
            onClick={() =>
              focusPreviewSection('header', 'channel-designer-section-header')
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                focusPreviewSection(
                  'header',
                  'channel-designer-section-header',
                );
              }
            }}
            className="relative min-h-52 cursor-pointer overflow-hidden p-5 transition-shadow outline-none hover:ring-2 hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-white/70 sm:p-7"
            style={{
              background: showHeaderVideo
                ? previewStyle.bg
                : previewStyle.gradient,
              color: previewStyle.fg,
            }}
          >
            {showHeaderVideo && headerBackdropIsImage && (
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src={previewVideoUrl || undefined}
                alt=""
              />
            )}
            {showHeaderVideo && !headerBackdropIsImage && (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={previewVideoUrl || undefined}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
              />
            )}
            {showGalleryBackdrop && (
              <img
                src={galleryImageList[galleryPreviewIndex]}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
            )}
            <div className="absolute inset-0 bg-black/25" />
            <div className="relative flex flex-wrap items-center gap-4">
              <div
                className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-lg font-bold"
                style={{
                  borderColor: previewStyle.accent,
                  background: previewStyle.bg,
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-full object-cover"
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
                {bio ? (
                  <p className="mt-1 line-clamp-2 text-sm opacity-90">{bio}</p>
                ) : null}
              </div>
              <span
                className="rounded px-2 py-1 text-[10px] font-bold tracking-wide uppercase"
                style={{ background: previewStyle.accent, color: '#0B1220' }}
              >
                Artist channel
              </span>
            </div>
            <nav
              aria-label="Channel preview navigation"
              className="relative mt-6 flex gap-5 border-t border-white/20 pt-3 text-xs font-semibold uppercase opacity-90"
            >
              <span
                className="border-b-2 pb-2"
                style={{ borderColor: previewStyle.accent }}
              >
                Home
              </span>
              <span className="pb-2">Tracks</span>
              <span className="pb-2">About</span>
            </nav>
          </div>

          <div className="flex flex-col gap-5 p-4 sm:p-6">
            <section
              role="button"
              tabIndex={0}
              aria-label="Edit player design"
              title="Edit player design"
              onClick={() =>
                focusPreviewSection(
                  'visualizer',
                  'channel-designer-section-player',
                )
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  focusPreviewSection(
                    'visualizer',
                    'channel-designer-section-player',
                  );
                }
              }}
              className="relative min-h-64 cursor-pointer overflow-hidden rounded-xl border border-white/10 transition-shadow outline-none hover:ring-2 hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-white/70"
              style={{
                background: visual.usePlayerGradient
                  ? (playerScheme.bg ?? DEFAULT_COLOR_SCHEME.bg)
                  : previewStyle.bg,
                color: previewStyle.fg,
              }}
            >
              {hasLivePreview && visualizerEnabled ? (
                <ChannelVisualizer
                  className="absolute inset-0 size-full"
                  preset={previewPreset}
                  colorScheme={visual.usePlayerGradient ? playerScheme : scheme}
                  visualSettingsJson={JSON.stringify(visualSettings)}
                  artworkUrl={avatarUrl}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: visual.usePlayerGradient
                      ? (playerScheme.bg ?? DEFAULT_COLOR_SCHEME.bg)
                      : previewStyle.bg,
                  }}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-16">
                <div className="text-[10px] font-semibold tracking-wide text-white/70 uppercase">
                  Now playing
                </div>
                <div className="mt-1 text-2xl font-extrabold text-white">
                  Your live channel
                </div>
                <div className="text-sm text-white/80">
                  A live preview of the artist stage
                </div>
              </div>
              <Button
                size="icon"
                className="bg-primary text-primary-foreground absolute right-4 bottom-4 size-12 rounded-full"
                aria-label="Play channel preview"
                title="Play channel preview"
              >
                <PlaySquareIcon size={20} aria-hidden />
              </Button>
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">Tracks</h3>
                <span className="text-foreground-secondary text-xs">
                  Published on your channel
                </span>
              </div>
              <div className="border-border divide-border divide-y overflow-hidden rounded-lg border">
                {['Latest release', 'Live session', 'Featured track'].map(
                  (title, index) => (
                    <div
                      key={title}
                      className="flex items-center gap-3 px-3 py-3"
                    >
                      <span className="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">
                          {title}
                        </div>
                        <div className="text-foreground-secondary text-xs">
                          {displayName}
                        </div>
                      </div>
                      <span className="text-foreground-secondary text-xs">
                        Preview
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>
            <section className="border-border rounded-lg border p-4">
              <h3 className="text-sm font-bold">About {displayName}</h3>
              <p className="text-foreground-secondary mt-1 line-clamp-2 text-sm">
                {bio || 'Your artist bio will appear here for visitors.'}
              </p>
            </section>
          </div>
        </main>

        <aside aria-label="Channel appearance controls" className="min-w-0">
          {controls}
        </aside>
      </div>

      {overlayConfigOpen ? (
        <Dialog.Root
          isOpen
          onClose={() => setOverlayConfigOpen(false)}
          className="max-w-lg"
        >
          <Dialog.Title>Configure text overlay</Dialog.Title>
          <Dialog.Description>
            Fine-tune the now-playing title and artist overlay used on your
            channel.
          </Dialog.Description>
          <div className="flex flex-col gap-4">
            <Slider
              label={`Text size: ${Math.round(overlaySettings.textScale * 100)}%`}
              min={0.6}
              max={1.6}
              step={0.05}
              value={overlaySettings.textScale}
              onValueChange={(value) => setOverlaySetting('textScale', value)}
            />
            <Slider
              label={`Horizontal position: ${overlaySettings.offsetX}px`}
              min={-120}
              max={120}
              step={4}
              value={overlaySettings.offsetX}
              onValueChange={(value) => setOverlaySetting('offsetX', value)}
            />
            <Slider
              label={`Vertical position: ${overlaySettings.offsetY}px`}
              min={-120}
              max={120}
              step={4}
              value={overlaySettings.offsetY}
              onValueChange={(value) => setOverlaySetting('offsetY', value)}
            />
            <Slider
              label={`Opacity: ${Math.round(overlaySettings.opacity * 100)}%`}
              min={0.2}
              max={1}
              step={0.05}
              value={overlaySettings.opacity}
              onValueChange={(value) => setOverlaySetting('opacity', value)}
            />
          </div>
        </Dialog.Root>
      ) : null}

      {visualizerPickerOpen ? (
        <Dialog.Root
          isOpen
          onClose={() => setVisualizerPickerOpen(false)}
          className="max-w-3xl"
        >
          <Dialog.Title>Choose visualizer</Dialog.Title>
          <Dialog.Description>
            Preview each animated stage and choose the one that fits your
            channel.
          </Dialog.Description>
          <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
            <div className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {availableVisualizers.map((preset) => {
                const meta = visualizerMetadata(preset);
                const selected = visualizerPickerPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setVisualizerPickerPreset(preset)}
                    className={`border-border flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="bg-background-secondary relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
                      {livePreview ? (
                        <span className="absolute inset-0" aria-hidden>
                          <ChannelVisualizer
                            preset={preset}
                            colorScheme={scheme}
                            visualSettingsJson={JSON.stringify(visualSettings)}
                            className="size-full"
                            audioReactive={false}
                          />
                        </span>
                      ) : (
                        <span
                          className="absolute inset-0 animate-pulse"
                          style={{
                            background: `linear-gradient(135deg, ${scheme.highlight ?? '#A78BFA'}, ${scheme.accent ?? '#22D3EE'}, ${scheme.bg ?? '#0B1220'})`,
                          }}
                        />
                      )}
                      <meta.Icon
                        size={16}
                        className="relative z-[1] text-white drop-shadow"
                        aria-hidden
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {preset.replace(/_/g, ' ')}
                      </span>
                      <span className="text-foreground-secondary block truncate text-xs">
                        {meta.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              className="border-border bg-background relative min-h-56 overflow-hidden rounded-xl border"
              aria-label={`${visualizerPickerPreset.replace(/_/g, ' ')} preview`}
            >
              {livePreview ? (
                <ChannelVisualizer
                  className="absolute inset-0 size-full"
                  preset={visualizerPickerPreset}
                  colorScheme={scheme}
                  visualSettingsJson={JSON.stringify(visualSettings)}
                  artworkUrl={avatarUrl}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: previewStyle.gradient }}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-16 text-white">
                <div className="text-xs font-semibold tracking-wide uppercase">
                  Live preview
                </div>
                <div className="mt-1 text-lg font-bold">
                  {visualizerPickerPreset.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          </div>
          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button
              onClick={() => {
                setPreviewPreset(visualizerPickerPreset);
                applyLocal({ visualPreset: visualizerPickerPreset });
                setVisualizerPickerOpen(false);
              }}
            >
              Use visualizer
            </Button>
          </Dialog.Actions>
        </Dialog.Root>
      ) : null}
    </div>
  );
}
