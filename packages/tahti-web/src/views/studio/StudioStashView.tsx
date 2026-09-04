import { PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, EmptyState, Tabs, Tooltip, ViewShell } from '@tahti-player/ui';

import { fetchStudioSounds } from '../../api/studio';
import type { StudioSound } from '../../api/studio-types';
import { StashFilesPanel } from '../../components/StashFilesPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { TrackEditDialog } from '../../components/TrackEditDialog';

export function StudioStashView({ embedded = false }: { embedded?: boolean }) {
  const [tab, setTab] = useState<'all' | 'files'>('all');
  const [items, setItems] = useState<StudioSound[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchStudioSounds().then((result) => {
      setItems(
        result.data.filter(
          (item) =>
            item.visibility === 'STASH' ||
            item.visibility === 'PRIVATE' ||
            item.visibility === 'UNLISTED' ||
            item.isPublic === false,
        ),
      );
    });
  }, []);

  const body = (
    <>
      <Tabs.Root
        selectedIndex={tab === 'files' ? 1 : 0}
        onChange={(index) => setTab(index === 1 ? 'files' : 'all')}
      >
        <Tabs.List aria-label="Stash sections">
          <Tabs.Tab>All stash</Tabs.Tab>
          <Tabs.Tab>Move to stash</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
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
            <EmptyState
              size="sm"
              title="No tracks in your stash yet"
              className="mt-4"
            />
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="border-border flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-foreground-secondary text-xs">
                      {item.contentType ?? 'Track'} · {item.status}
                    </p>
                  </div>
                  <Tooltip content="Edit track" side="top">
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label={`Edit ${item.title}`}
                      onClick={() => setEditingId(item.id)}
                    >
                      <PencilIcon size={14} aria-hidden />
                    </Button>
                  </Tooltip>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );

  return (
    <StudioGate>
      <div className="studio-page-layout mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        {!embedded && <StudioNav current="/studio/stash" />}
        {!embedded ? (
          <ViewShell
            title="Stash"
            subtitle="Private work in progress."
            classes={{ root: 'px-0 pt-0' }}
          >
            {body}
          </ViewShell>
        ) : (
          body
        )}
        <TrackEditDialog
          soundId={editingId}
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
