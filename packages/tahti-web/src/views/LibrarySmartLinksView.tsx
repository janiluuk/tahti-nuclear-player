import { Link } from '@tanstack/react-router';
import { ExternalLinkIcon, Link2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchStudioReleases } from '../api/studio';
import type { StudioRelease } from '../api/studio-types';
import { PageLoading } from '../components/PageStates';
import { StudioGate } from '../components/StudioGate';
import { StudioNav } from '../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../components/StudioPanel';

const DSP_LABELS: Record<string, string> = {
  apple: 'Apple Music',
  appleMusic: 'Apple Music',
  bandcamp: 'Bandcamp',
  deezer: 'Deezer',
  mixcloud: 'Mixcloud',
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  tidal: 'Tidal',
  youtube: 'YouTube',
  youtubeMusic: 'YouTube Music',
};

function targetLabel(provider: string): string {
  return DSP_LABELS[provider] ?? provider.replace(/[-_]/g, ' ');
}

function releaseTargets(release: StudioRelease): Array<[string, string]> {
  return Object.entries(release.smartLinkTargets ?? {}).filter(([, url]) =>
    Boolean(url),
  );
}

export function LibrarySmartLinksView() {
  const [releases, setReleases] = useState<StudioRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStudioReleases().then((result) => {
      setReleases(result.data.releases);
      setLoading(false);
    });
  }, []);

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/library/smartlinks" />
        <StudioPageHeader
          title="Smartlinks"
          subtitle="Give every release one public page with links to the services where listeners can hear it."
          action={
            <Link to="/studio/releases">
              <Button size="sm">New release</Button>
            </Link>
          }
        />
        <StudioPanel>
          {loading ? (
            <PageLoading label="Loading smartlinks…" />
          ) : releases.length === 0 ? (
            <div className="flex flex-col gap-3 py-5 text-center">
              <Link2Icon
                size={28}
                className="text-foreground-secondary mx-auto"
                aria-hidden
              />
              <p className="text-sm font-medium">No releases yet</p>
              <p className="text-foreground-secondary text-sm">
                Create a release to get its public smartlink page.
              </p>
              <Link to="/studio/releases">
                <Button size="sm">Create release</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {releases.map((release) => {
                const targets = releaseTargets(release);
                return (
                  <li
                    key={release.id}
                    className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      {release.artworkUrl ? (
                        <img
                          src={release.artworkUrl}
                          alt=""
                          className="size-12 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="border-border bg-background-secondary flex size-12 shrink-0 items-center justify-center rounded-md border">
                          <Link2Icon
                            size={18}
                            className="text-foreground-secondary"
                            aria-hidden
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to="/studio/releases/$id"
                          params={{ id: release.id }}
                          className="font-medium hover:underline"
                        >
                          {release.title}
                        </Link>
                        <p className="text-foreground-secondary text-xs">
                          {release.type} · {release.state}
                          {typeof release._count?.tracks === 'number'
                            ? ` · ${release._count.tracks} track${release._count.tracks === 1 ? '' : 's'}`
                            : ''}
                        </p>
                        <p className="text-foreground-secondary mt-1 text-xs">
                          {targets.length > 0
                            ? `${targets.length} DSP link${targets.length === 1 ? '' : 's'}: ${targets.map(([provider]) => targetLabel(provider)).join(', ')}`
                            : 'No DSP links added yet'}
                          {typeof release.smartLinkViewCount === 'number'
                            ? ` · ${release.smartLinkViewCount.toLocaleString()} views`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to="/studio/releases/$id"
                        params={{ id: release.id }}
                      >
                        <Button size="sm" variant="secondary">
                          Manage
                        </Button>
                      </Link>
                      <Link
                        to="/r/$slug"
                        params={{ slug: release.smartLinkSlug }}
                      >
                        <Button
                          size="sm"
                          variant="text"
                          aria-label={`Open smartlink for ${release.title}`}
                          title="Open smartlink"
                        >
                          <ExternalLinkIcon size={15} aria-hidden />
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
