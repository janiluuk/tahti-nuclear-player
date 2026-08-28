import { Link, useNavigate } from '@tanstack/react-router';
import {
  CircleDotIcon,
  CloudIcon,
  LinkIcon,
  RadioIcon,
  UploadIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Button, FilePicker, Input } from '@nuclearplayer/ui';

import { uploadArchiveFile } from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';

export function StudioUploadView() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const alternateSources = [
    {
      id: 'bandcamp',
      title: 'Bandcamp',
      description: 'Import your own releases with FLAC masters',
      icon: CircleDotIcon,
    },
    {
      id: 'soundcloud',
      title: 'SoundCloud',
      description: 'Import downloadable tracks you own',
      icon: CircleDotIcon,
    },
    {
      id: 'google-drive',
      title: 'Google Drive',
      description: 'Pick audio from your cloud storage — no local download',
      icon: CloudIcon,
    },
    {
      id: 'url',
      title: 'Paste URL',
      description: 'Spotify, Apple Music, YouTube — embed-only smart link',
      icon: LinkIcon,
    },
    {
      id: 'mixcloud',
      title: 'Rescue from Mixcloud',
      description:
        'Re-upload your own backup of a mix — second-best, but better than nothing',
      icon: RadioIcon,
    },
  ] as const;

  const submit = async () => {
    if (!file) {
      setMessage('Choose an audio file.');
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await uploadArchiveFile({ file, title: title || file.name });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    // Land on the durable /studio/archive/$id route rather than staying here —
    // that page polls and shows processing state, so it survives a refresh or
    // a share/bookmark of the URL in a way this ephemeral form state can't.
    void navigate({ to: '/studio/archive/$id', params: { id: result.itemId } });
  };

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/upload" />
        <StudioPageHeader
          title="Upload"
          subtitle="Add music to your archive from a local file, a broadcast, or an external source."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border-accent-cyan flex min-h-48 flex-col justify-center rounded-xl border border-dashed p-5 sm:p-6">
            <FilePicker
              labels={{
                title: 'Choose audio file',
                description: 'FLAC · WAV · AIFF · MP3 · M4A · OGG · max 4 GB',
                browse: file ? 'Choose another file' : 'Choose audio',
              }}
              accept="audio/*,.flac,.wav,.mp3,.aiff"
              selectedFiles={file ? [file] : []}
              onFiles={(files) => setFile(files[0] ?? null)}
            />
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Optional — defaults to filename"
            />
            {message && (
              <p className="text-accent-red text-sm" role="alert">
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button disabled={busy || !file} onClick={() => void submit()}>
                <UploadIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>

          <div className="border-accent-green flex min-h-48 flex-col justify-between rounded-xl border p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <RadioIcon size={15} aria-hidden />
              Publish from broadcast
            </div>
            <p className="text-foreground-secondary text-sm">
              No recent unpublished broadcasts.
              <Link
                to="/studio/go-live"
                className="text-accent-cyan ml-1 underline-offset-2 hover:underline"
              >
                Go live to record one.
              </Link>
            </p>
          </div>
        </div>

        <section aria-labelledby="other-ways-title">
          <h2
            id="other-ways-title"
            className="text-foreground-secondary mb-3 text-xs font-semibold tracking-wide uppercase"
          >
            Other ways to add content
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alternateSources.map((source) => {
              const Icon = source.icon;
              return (
                <Link
                  key={source.id}
                  to="/sources/$id"
                  params={{ id: source.id }}
                  className="border-border hover:border-accent-cyan group rounded-lg border p-4 transition-colors"
                >
                  <Icon
                    size={16}
                    aria-hidden
                    className="text-foreground-secondary group-hover:text-accent-cyan"
                  />
                  <h3 className="text-accent-cyan mt-2 text-sm font-medium">
                    {source.title}
                  </h3>
                  <p className="text-foreground-secondary mt-1 text-xs leading-relaxed">
                    {source.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <Link
          to="/studio/collections"
          className="text-accent-cyan text-sm underline-offset-2 hover:underline"
        >
          Organise into collections →
        </Link>
      </div>
    </StudioGate>
  );
}
