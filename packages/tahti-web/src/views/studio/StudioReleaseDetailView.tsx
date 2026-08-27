import { Link } from '@tanstack/react-router';
import { ExternalLinkIcon, PlayIcon, Share2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Button,
  EmptyState,
  FilePicker,
  Input,
  SaveButton,
  Tabs,
} from '@nuclearplayer/ui';

import {
  fetchEditorSource,
  fetchStudioArchiveItem,
  fetchStudioReleases,
  patchStudioRelease,
  uploadReleaseArtwork,
} from '../../api/studio';
import type { FingerprintMatch, StudioRelease } from '../../api/studio-types';
import { EmbedTrackRow } from '../../components/EmbedTrackRow';
import { FingerprintTrackPanel } from '../../components/FingerprintTrackPanel';
import { MusicBrainzSubmissionAssistant } from '../../components/MusicBrainzSubmissionAssistant';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';

export function StudioReleaseDetailView({ id }: { id: string }) {
  const user = useAuthStore((state) => state.user);
  const [release, setRelease] = useState<StudioRelease | null>(null);
  const [description, setDescription] = useState('');
  const [spotify, setSpotify] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchStudioReleases().then((res) => {
      const found = res.data.releases.find((r) => r.id === id) ?? null;
      setRelease(found);
      setDescription(found?.description ?? '');
      setSpotify(found?.smartLinkTargets?.spotify ?? '');
      setArtworkPreview(found?.artworkUrl ?? null);
    });
  }, [id]);

  const save = async () => {
    setMessage(null);
    setSaving(true);
    const result = await patchStudioRelease(id, {
      description,
      smartLinkTargets: spotify ? { spotify } : {},
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRelease(result.data);
    setMessage('Saved.');
  };

  const updateTrackFingerprint = (
    trackId: string,
    match: FingerprintMatch | null,
  ) => {
    setRelease((prev) =>
      prev
        ? {
            ...prev,
            tracks: prev.tracks?.map((t) =>
              t.id === trackId ? { ...t, fingerprintMatch: match } : t,
            ),
          }
        : prev,
    );
  };

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-2xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/releases" />
        <Link
          to="/studio/releases"
          className="text-foreground-secondary -mt-2 text-xs hover:underline"
        >
          ← Releases
        </Link>
        {!release ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">
              Release not found in list.
            </p>
          </StudioPanel>
        ) : (
          <>
            <StudioPageHeader
              title={release.title}
              subtitle={`${release.state} — /r/${release.smartLinkSlug}`}
              action={
                <div className="flex flex-wrap justify-end gap-2">
                  <MusicBrainzSubmissionAssistant
                    mode="release"
                    title={release.title}
                    artistName={user?.displayName ?? ''}
                    releaseDate={release.releaseDate}
                    barcode={release.upc}
                    tracks={release.tracks}
                  />
                  <SaveButton saving={saving} onClick={() => void save()} />
                </div>
              }
            />

            <Tabs
              listClassName="border-border border-b pb-3"
              panelClassName="flex flex-col gap-6 pt-2"
              items={[
                {
                  id: 'overview',
                  label: 'Overview',
                  content: (
                    <>
                      <StudioPanel title="Artwork">
                        <div className="flex flex-wrap items-start gap-4">
                          {artworkPreview ? (
                            <img
                              src={artworkPreview}
                              alt=""
                              className="border-border h-28 w-28 rounded-lg border object-cover shadow-sm"
                            />
                          ) : (
                            <div className="border-border bg-background text-foreground-secondary flex h-28 w-28 items-center justify-center rounded-lg border text-xs">
                              No art
                            </div>
                          )}
                          <FilePicker
                            className="min-w-0 flex-1"
                            labels={{
                              title: 'Release artwork',
                              description: 'JPEG, PNG, or WebP',
                              browse: 'Choose image',
                            }}
                            accept="image/jpeg,image/png,image/webp"
                            onFiles={(files) => {
                              const file = files[0];
                              if (!file) {
                                return;
                              }
                              void uploadReleaseArtwork(id, file).then((r) => {
                                if (!r.ok) {
                                  setMessage(r.error);
                                } else {
                                  setArtworkPreview(r.artworkUrl);
                                  setMessage('Artwork uploaded.');
                                }
                              });
                            }}
                          />
                        </div>
                      </StudioPanel>

                      <StudioPanel title="Details">
                        <div className="flex flex-col gap-3">
                          <label className="flex flex-col gap-1 text-sm">
                            <span className="text-foreground-secondary text-xs uppercase">
                              Description
                            </span>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={3}
                              className="border-border bg-background focus:border-primary rounded-md border px-3 py-2 outline-none"
                            />
                          </label>
                          <Input
                            label="Spotify URL (smart link target)"
                            value={spotify}
                            onChange={(e) => setSpotify(e.target.value)}
                          />
                        </div>
                      </StudioPanel>

                      {release.tracks && release.tracks.length > 0 && (
                        <StudioPanel title="Tracks">
                          <ol className="text-foreground-secondary list-decimal space-y-2 pl-5 text-sm">
                            {release.tracks.map((t) => (
                              <ReleaseTrackRow key={t.id} track={t} />
                            ))}
                          </ol>
                        </StudioPanel>
                      )}

                      {message && <p className="text-sm">{message}</p>}

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            void patchStudioRelease(id, {
                              state: 'PUBLISHED',
                            }).then((r) => {
                              if (!r.ok) {
                                setMessage(r.error);
                              } else {
                                setRelease(r.data);
                                setMessage('Published.');
                              }
                            });
                          }}
                        >
                          Publish
                        </Button>
                        <Link
                          to="/r/$slug"
                          params={{ slug: release.smartLinkSlug }}
                        >
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label="Open smart link"
                            title="Open smart link"
                          >
                            <ExternalLinkIcon size={16} aria-hidden />
                          </Button>
                        </Link>
                        <Link to="/studio/distribution">
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label="Distribution"
                            title="Distribution"
                          >
                            <Share2Icon size={16} aria-hidden />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ),
                },
                {
                  id: 'fingerprinting',
                  label: 'Fingerprinting',
                  content: (
                    <StudioPanel
                      title="Fingerprinting"
                      description="Optional. Checks each track against AcoustID's public database of released music, so you get a heads-up if it matches something already out there — nothing is blocked either way. Every upload is checked automatically; use the buttons below only to re-check a track you just replaced, or to check one on demand."
                    >
                      {(() => {
                        const fingerprintable = (release.tracks ?? []).filter(
                          (t) => t.sourceKey,
                        );
                        if (fingerprintable.length === 0) {
                          return (
                            <EmptyState
                              size="sm"
                              title="No tracks have audio uploaded yet"
                              description="Fingerprinting needs a track's audio file on file first."
                            />
                          );
                        }
                        return (
                          <div className="flex flex-col gap-3">
                            {fingerprintable.map((t) => (
                              <FingerprintTrackPanel
                                key={t.id}
                                releaseId={id}
                                track={t}
                                onUpdated={(match) =>
                                  updateTrackFingerprint(t.id, match)
                                }
                              />
                            ))}
                          </div>
                        );
                      })()}
                    </StudioPanel>
                  ),
                },
              ]}
            />
          </>
        )}
      </div>
    </StudioGate>
  );
}

function ReleaseTrackRow({
  track,
}: {
  track: NonNullable<StudioRelease['tracks']>[number];
}) {
  const play = usePlayerStore((state) => state.play);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [embed, setEmbed] = useState<{
    provider: 'HEARTHIS' | 'MIXCLOUD' | 'SPOTIFY';
    uri: string;
  } | null>(null);

  useEffect(() => {
    if (!track.archiveItemId) {
      return;
    }
    const archiveId = track.archiveItemId;
    void fetchStudioArchiveItem(archiveId).then((result) => {
      if (result.data.embedProvider && result.data.embedUri) {
        setEmbed({
          provider: result.data.embedProvider,
          uri: result.data.embedUri,
        });
        return;
      }
      void fetchEditorSource(archiveId).then((source) =>
        setSourceUrl(source.data.url),
      );
    });
  }, [track.archiveItemId]);

  if (embed) {
    return (
      <EmbedTrackRow
        title={track.title}
        provider={embed.provider}
        embedUri={embed.uri}
      />
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-2">
      <span className="min-w-0 flex-1 truncate">{track.title}</span>
      {sourceUrl ? (
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label={`Play ${track.title}`}
          title={`Play ${track.title}`}
          onClick={() =>
            play({
              id: `archive:${track.archiveItemId}`,
              kind: 'archive',
              title: track.title,
              artist: 'You',
              streamUrl: sourceUrl,
              protocol: sourceUrl.includes('.m3u8') ? 'hls' : 'https',
            })
          }
        >
          <PlayIcon size={15} aria-hidden />
        </Button>
      ) : null}
      {track.archiveItemId ? (
        <Link
          to="/studio/archive/$id/editor"
          params={{ id: track.archiveItemId }}
          className="text-primary text-xs underline"
        >
          editor
        </Link>
      ) : null}
    </li>
  );
}
