import isEmpty from 'lodash-es/isEmpty';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { FC, useMemo, useRef, useState } from 'react';

import { useTranslation } from '@tahti-player/i18n';
import { ArtistRef, pickArtwork } from '@tahti-player/model';
import type { AttributedResult } from '@tahti-player/plugin-sdk';
import { Badge, Button, Input, Loader, MediaArtwork } from '@tahti-player/ui';

import { useDashboardTopArtists } from '../hooks/useDashboardData';
import { useNavigateToEntity } from '../hooks/useNavigateToEntity';

export const TopArtistsWidget: FC = () => {
  const { t } = useTranslation('dashboard');
  const { data: results, isLoading } = useDashboardTopArtists();
  const navigateToEntity = useNavigateToEntity();
  const [filterText, setFilterText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredResults = useMemo(
    () =>
      results?.map((result) => ({
        ...result,
        items: result.items.filter((artist) =>
          artist.name.toLowerCase().includes(filterText.toLowerCase()),
        ),
      })),
    [filterText, results],
  );

  if (isLoading) {
    return (
      <div
        data-testid="dashboard-top-artists"
        className="flex justify-center p-4"
      >
        <Loader data-testid="dashboard-top-artists-loader" />
      </div>
    );
  }

  if (isEmpty(results)) {
    return null;
  }

  return (
    <section
      data-testid="dashboard-top-artists"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground text-lg font-bold">
            {t('top-artists')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Input
            data-testid="cards-row-filter"
            size="sm"
            tone="secondary"
            placeholder={t('filter-artists')}
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            endAddon={
              <button
                data-testid="cards-row-clear-filter"
                type="button"
                aria-label={t('clear-filter')}
                className="text-foreground cursor-pointer"
                onClick={() => setFilterText('')}
              >
                {filterText ? <X size={14} /> : <Filter size={14} />}
              </button>
            }
          />
          <Button
            data-testid="cards-row-scroll-left"
            size="icon"
            onClick={() =>
              scrollContainerRef.current?.scrollBy({
                left: -320,
                behavior: 'smooth',
              })
            }
            variant="noShadow"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            data-testid="cards-row-scroll-right"
            size="icon"
            onClick={() =>
              scrollContainerRef.current?.scrollBy({
                left: 320,
                behavior: 'smooth',
              })
            }
            variant="noShadow"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredResults?.every((result) => isEmpty(result.items)) ? (
          <div className="text-foreground-secondary py-8 text-sm">
            {t('nothing-found')}
          </div>
        ) : (
          filteredResults?.flatMap((result) =>
            result.items.map((artist) => (
              <div
                key={`${result.providerId}-${artist.source.id}`}
                className="dashboard-artist-banner-glow relative h-44 w-80 flex-shrink-0"
              >
                <button
                  data-testid="card"
                  type="button"
                  className="border-border shadow-shadow hover:translate-x-shadow-x hover:translate-y-shadow-y relative size-full overflow-hidden rounded-md border-(length:--border-width) text-left transition-all hover:shadow-none"
                  onClick={() =>
                    navigateToEntity(
                      { name: artist.name, sourceId: artist.source.id },
                      result as AttributedResult<ArtistRef>,
                      'artist',
                    )
                  }
                >
                  <MediaArtwork
                    size="fill"
                    src={pickArtwork(artist.artwork, 'cover', 600)?.url}
                    alt={artist.name}
                    className="absolute inset-0 size-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/90 via-black/50 to-transparent px-4 pt-12 pb-3">
                    <span className="text-lg font-bold text-white">
                      {artist.name}
                    </span>
                    <Badge variant="pill" color="purple">
                      {result.providerName}
                    </Badge>
                  </div>
                </button>
              </div>
            )),
          )
        )}
      </div>
    </section>
  );
};
