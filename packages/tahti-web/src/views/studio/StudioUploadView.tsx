import { Link, useNavigate } from '@tanstack/react-router';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

import { Button, FilePicker, Input } from '@nuclearplayer/ui';

import { uploadArchiveFile } from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioUploadView() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <StudioNav current="/studio/upload" />
        <StudioPageHeader
          title="Upload"
          subtitle="Add a track to your Music archive. MP3, WAV, FLAC, or AIFF."
          action={
            <Link to="/sources">
              <Button size="sm" variant="secondary">
                Open Sources
              </Button>
            </Link>
          }
        />
        <StudioPanel
          title="Audio file"
          description="Choose a local file and give it an optional display title."
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Optional — defaults to filename"
            />
            <FilePicker
              labels={{
                title: 'Audio file',
                description: 'MP3, WAV, FLAC, or AIFF',
                browse: file ? 'Choose another file' : 'Choose audio',
              }}
              accept="audio/*,.flac,.wav,.mp3,.aiff"
              selectedFiles={file ? [file] : []}
              onFiles={(files) => setFile(files[0] ?? null)}
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
        </StudioPanel>
        <p className="text-foreground-secondary text-xs">
          <Link to="/studio/archive" className="hover:underline">
            ← Back to Music
          </Link>
        </p>
      </div>
    </StudioGate>
  );
}
