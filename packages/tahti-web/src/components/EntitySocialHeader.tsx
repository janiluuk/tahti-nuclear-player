import { MapPinIcon, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { StatChip } from '@tahti-player/ui';

import { isHeaderImageUrl } from '../api/channel-design';
import { cn } from '../lib/cn';
import { ChannelVisualizer } from './ChannelVisualizer';

const VIDEO_BACKDROP_PATTERN = /\.(mp4|webm)(\?|$)/i;

function isImageBackdropUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  if (VIDEO_BACKDROP_PATTERN.test(url)) {
    return false;
  }
  return isHeaderImageUrl(url) || url.startsWith('http') || url.startsWith('/');
}

const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact' });

export function formatCompactStat(value: number): string {
  return compactFormatter.format(value);
}

export type EntitySocialStat = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
};

export type EntitySocialHeaderProps = {
  title: string;
  /** Square cover / avatar shown beside the title. */
  imageUrl?: string | null;
  imageAlt?: string;
  /** When true, image is a circle (artist); otherwise rounded square (collection). */
  roundImage?: boolean;
  /** Optional location / place badge under the title. */
  location?: string | null;
  /** Subtitle row under title (e.g. @username or “by Artist”). */
  subtitle?: ReactNode;
  /** Description under subtitle. */
  description?: ReactNode;
  /** Top-right actions (favorite, edit, …). */
  actions?: ReactNode;
  stats?: EntitySocialStat[];
  /** Backdrop image / video poster under the primary scrim. */
  backdropUrl?: string | null;
  /** Mount a visualizer when there is no image backdrop. */
  visualizerPreset?: string;
  artworkUrlForVisualizer?: string | null;
  onImageClick?: () => void;
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
};

/**
 * Nuclear-style entity header: `bg-primary` card with optional backdrop /
 * visualizer under a scrim, identity row, icon StatChips, and top-right actions.
 */
export function EntitySocialHeader({
  title,
  imageUrl,
  imageAlt = '',
  roundImage = false,
  location,
  subtitle,
  description,
  actions,
  stats = [],
  backdropUrl,
  visualizerPreset,
  artworkUrlForVisualizer,
  onImageClick,
  className,
  children,
  'data-testid': dataTestId = 'entity-social-header',
}: EntitySocialHeaderProps) {
  const imageBackdrop =
    backdropUrl && isImageBackdropUrl(backdropUrl) ? backdropUrl : null;
  const hasImageBackdrop = Boolean(imageBackdrop);
  const showVisualizer = !hasImageBackdrop && Boolean(visualizerPreset);
  const activeStats = stats.filter((stat) => stat.value > 0);

  return (
    <div
      className={cn(
        'border-border bg-primary shadow-shadow relative isolate flex flex-col gap-5 overflow-hidden rounded-md border-(length:--border-width) p-6',
        className,
      )}
      data-testid={dataTestId}
    >
      {imageBackdrop ? (
        <img
          src={imageBackdrop}
          alt=""
          className="pointer-events-none absolute inset-0 -z-10 size-full scale-110 object-cover opacity-35 blur-3xl"
          aria-hidden
        />
      ) : null}
      {showVisualizer && visualizerPreset ? (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-55">
          <ChannelVisualizer
            preset={visualizerPreset}
            artworkUrl={artworkUrlForVisualizer ?? imageUrl ?? undefined}
            className="size-full"
          />
        </div>
      ) : null}
      <div className="bg-primary/75 pointer-events-none absolute inset-0 -z-10 backdrop-blur-xl" />

      {actions ? (
        <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-5">
        {imageUrl ? (
          onImageClick ? (
            <button
              type="button"
              onClick={onImageClick}
              className={cn(
                'border-border shadow-shadow size-24 shrink-0 overflow-hidden border-(length:--border-width) p-0',
                roundImage ? 'rounded-full' : 'rounded-md',
              )}
              aria-label={`View ${title} artwork`}
            >
              <img
                src={imageUrl}
                alt={imageAlt}
                className="size-full object-cover"
              />
            </button>
          ) : (
            <img
              src={imageUrl}
              alt={imageAlt}
              className={cn(
                'border-border shadow-shadow size-24 shrink-0 border-(length:--border-width) object-cover',
                roundImage ? 'rounded-full' : 'rounded-md',
              )}
            />
          )
        ) : (
          <div
            className={cn(
              'border-border bg-background-secondary/40 shadow-shadow size-24 shrink-0 border-(length:--border-width)',
              roundImage ? 'rounded-full' : 'rounded-md',
            )}
            aria-hidden
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 pr-12">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          {location ? (
            <span className="bg-accent-orange border-border inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-bold">
              <MapPinIcon size={14} aria-hidden />
              {location}
            </span>
          ) : null}
          {subtitle ? (
            <div className="text-foreground-secondary text-sm">{subtitle}</div>
          ) : null}
          {description ? (
            <div className="text-foreground mt-1 text-sm">{description}</div>
          ) : null}
        </div>
      </div>

      {activeStats.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {activeStats.map((stat) => (
            <StatChip
              key={stat.key}
              value={formatCompactStat(stat.value)}
              label={stat.label}
              icon={<stat.icon size={16} aria-hidden />}
            />
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
}
