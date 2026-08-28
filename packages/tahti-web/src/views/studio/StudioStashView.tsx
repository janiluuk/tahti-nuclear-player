import { PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchStudioArchive } from '../../api/studio';
import type { StudioArchiveItem } from '../../api/studio-types';
import { StashFilesPanel } from '../../components/StashFilesPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';
import { TrackEditDialog } from '../../components/TrackEditDialog';

export function StudioStashView() {
  const [tab, setTab] = useState<'all' | 'files'>('all');
  const [items, setItems] = useState<StudioArchiveItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchStudioArchive().then((result) => {
      setItems(
        result.data.filter(
          (item) =>
            item.visibility === 'STASH' ||
            item.visibility === 'PRIVATE' ||
            item.isPublic === false,
        ),
      );
    });
  }, []);

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/stash" />
        <StudioPageHeader
          title="Stash"
          subtitle="Private locker — upload work in progress and grant access only when it is ready."
        />
        <div
          className="border-border flex gap-1 border-b pb-2"
          role="tablist"
          aria-label="Stash sections"
        >
          <Button
            size="xs"
            variant={tab === 'all' ? undefined : 'text'}
            role="tab"
            aria-selected={tab === 'all'}
            onClick={() => setTab('all')}
          >
            All stash
          </Button>
          <Button
            size="xs"
            variant={tab === 'files' ? undefined : 'text'}
            role="tab"
            aria-selected={tab === 'files'}
            onClick={() => setTab('files')}
          >
            Files
          </Button>
        </div>
        {tab === 'files' ? (
          <StashFilesPanel />
        ) : (
          <section
            className="border-border rounded-xl border p-4"
            aria-labelledby="stash-items-title"
          >
            <h2 id="stash-items-title" className="text-sm font-semibold">
              Stash tracks
            </h2>
            <p className="text-foreground-secondary mt-1 text-xs">
              Edit these items like any other track. They stay out of public
              listings.
            </p>
            {items.length === 0 ? (
              <p className="text-foreground-secondary mt-4 text-sm">
                No tracks in your stash yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="border-border flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-foreground-secondary text-xs">
                        {item.contentType ?? 'Track'} · {item.status}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label={`Edit ${item.title}`}
                      title="Edit track"
                      onClick={() => setEditingId(item.id)}
                    >
                      <PencilIcon size={14} aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <TrackEditDialog
          archiveItemId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={(saved) =>
            setItems((current) =>
              current.map((item) => (item.id === saved.id ? saved : item)),
            )
          }
        />
      </div>
    </StudioGate>
  );
}
