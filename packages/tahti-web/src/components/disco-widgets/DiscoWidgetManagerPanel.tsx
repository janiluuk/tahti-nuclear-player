import { Link } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Dialog, PluginStoreItem } from '@tahti-player/ui';

import {
  createDiscoWidgetInstall,
  fetchDiscoWidgetInstalls,
  fetchDiscoWidgetStore,
  patchDiscoWidgetInstall,
  removeDiscoWidgetInstall,
  type DiscoWidgetInstallView,
  type DiscoWidgetScope,
  type DiscoWidgetStoreItem,
} from '../../api/disco-widgets';
import { PageLoading } from '../PageStates';

export function DiscoWidgetManagerPanel({
  scope,
  description,
  compact = false,
}: {
  scope: DiscoWidgetScope;
  /** Omit when the caller already shows an equivalent description above
   * this panel (e.g. the Add-ons category body). */
  description?: string;
  compact?: boolean;
}) {
  const [widgets, setWidgets] = useState<DiscoWidgetStoreItem[]>([]);
  const [installs, setInstalls] = useState<DiscoWidgetInstallView[]>([]);
  const [loading, setLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      fetchDiscoWidgetStore(scope),
      fetchDiscoWidgetInstalls(scope),
    ]).then(([store, mine]) => {
      if (cancelled) {
        return;
      }
      setWidgets(store.data);
      setInstalls(mine.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const installedWidgetIds = useMemo(
    () => new Set(installs.map((install) => install.widget.id)),
    [installs],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return widgets;
    }
    return widgets.filter(
      (widget) =>
        widget.name.toLowerCase().includes(q) ||
        widget.description.toLowerCase().includes(q) ||
        widget.authorName.toLowerCase().includes(q),
    );
  }, [widgets, search]);

  async function handleInstall(widgetId: string) {
    setError(null);
    setInstallingId(widgetId);
    const result = await createDiscoWidgetInstall(scope, widgetId);
    setInstallingId(null);
    if (result.error || !result.data) {
      setError(result.error ?? 'Failed to install');
      return;
    }
    setInstalls((prev) => [...prev, result.data]);
  }

  async function handleToggle(id: string, enabled: boolean) {
    setError(null);
    setPendingId(id);
    const result = await patchDiscoWidgetInstall(scope, id, { enabled });
    setPendingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInstalls((prev) =>
      prev.map((install) =>
        install.id === id ? { ...install, enabled } : install,
      ),
    );
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const index = installs.findIndex((install) => install.id === id);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= installs.length) {
      return;
    }
    const a = installs[index];
    const b = installs[swapWith];
    if (!a || !b) {
      return;
    }
    setError(null);
    setPendingId(id);
    const [resA, resB] = await Promise.all([
      patchDiscoWidgetInstall(scope, a.id, { position: b.position }),
      patchDiscoWidgetInstall(scope, b.id, { position: a.position }),
    ]);
    setPendingId(null);
    if (resA.error || resB.error) {
      setError(resA.error ?? resB.error ?? 'Failed to reorder');
      return;
    }
    setInstalls((prev) => {
      const next = [...prev];
      next[index] = { ...a, position: b.position };
      next[swapWith] = { ...b, position: a.position };
      return next.sort((x, y) => x.position - y.position);
    });
  }

  async function handleRemove(id: string) {
    setError(null);
    setPendingId(id);
    const result = await removeDiscoWidgetInstall(scope, id);
    setPendingId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInstalls((prev) => prev.filter((install) => install.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      {description && (
        <p className="text-foreground-secondary text-sm">{description}</p>
      )}
      {loading ? (
        <PageLoading label="Loading widgets…" />
      ) : (
        <>
          {installs.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              Nothing installed yet — add one from the store below.
            </p>
          ) : (
            <div
              className={
                compact ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-col gap-3'
              }
            >
              {installs.map((install, index) => {
                const isPending = pendingId === install.id;
                return (
                  <div
                    key={install.id}
                    className="border-border flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3"
                    style={{ opacity: install.enabled ? 1 : 0.55 }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm">
                          {install.widget.name}
                        </strong>
                        <span className="text-foreground-secondary font-mono text-xs">
                          v{install.widget.currentVersion}
                        </span>
                      </div>
                      <p className="text-foreground-secondary mt-1 text-xs">
                        {install.widget.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        disabled={isPending || index === 0}
                        onClick={() => void handleMove(install.id, 'up')}
                        aria-label="Move up"
                        title="Move up"
                      >
                        <ArrowUp size={15} aria-hidden />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        disabled={isPending || index === installs.length - 1}
                        onClick={() => void handleMove(install.id, 'down')}
                        aria-label="Move down"
                        title="Move down"
                      >
                        <ArrowDown size={15} aria-hidden />
                      </Button>
                      {compact ? null : (
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          disabled={isPending}
                          onClick={() => setConfiguringId(install.id)}
                          aria-label={`Configure ${install.widget.name}`}
                          title="Configure widget"
                        >
                          <Settings2 size={15} aria-hidden />
                        </Button>
                      )}
                      <label className="text-foreground-secondary flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={install.enabled}
                          disabled={isPending}
                          onChange={(e) =>
                            void handleToggle(install.id, e.target.checked)
                          }
                        />
                        Enabled
                      </label>
                      <Button
                        size="sm"
                        variant="text"
                        disabled={isPending}
                        onClick={() => void handleRemove(install.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              Browse the store
            </h3>
            <input
              type="search"
              className="border-border bg-background rounded-md border px-3 py-2 text-sm"
              placeholder="Search widgets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search Disco-widgets"
            />
            <p className="text-foreground-secondary text-xs">
              Don&apos;t see what you need? Anyone can build a widget —{' '}
              <Link
                to="/help/$slug"
                params={{ slug: 'disco-widgets' }}
                className="underline-offset-2 hover:underline"
              >
                learn how to submit your own
              </Link>
              .
            </p>
            {filtered.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                {widgets.length === 0
                  ? 'No widgets available in this store yet.'
                  : 'No widgets match your search.'}
              </p>
            ) : (
              <div
                className={
                  compact ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-col gap-3'
                }
              >
                {filtered.map((widget) => (
                  <PluginStoreItem
                    key={widget.id}
                    icon={
                      widget.iconUrl ? (
                        <img
                          src={widget.iconUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : undefined
                    }
                    name={widget.name}
                    author={widget.authorName}
                    description={widget.description}
                    categories={widget.categories}
                    version={widget.currentVersion}
                    isInstalled={installedWidgetIds.has(widget.id)}
                    isInstalling={installingId === widget.id}
                    onInstall={() => void handleInstall(widget.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {error ? <p className="text-accent-red text-sm">{error}</p> : null}
      <Dialog.Root
        isOpen={configuringId !== null}
        onClose={() => setConfiguringId(null)}
      >
        <Dialog.Title>Configure widget</Dialog.Title>
        <Dialog.Description>
          Choose whether this widget is visible and adjust its order on the
          Listen page.
        </Dialog.Description>
        {configuringId
          ? (() => {
              const install = installs.find(
                (candidate) => candidate.id === configuringId,
              );
              if (!install) {
                return null;
              }
              const installIndex = installs.indexOf(install);
              const isPending = pendingId === install.id;
              return (
                <div className="flex flex-col gap-3">
                  <p className="font-semibold">{install.widget.name}</p>
                  <label className="text-foreground-secondary flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={install.enabled}
                      disabled={isPending}
                      onChange={(event) =>
                        void handleToggle(install.id, event.target.checked)
                      }
                    />
                    Show this widget on Listen
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isPending || installIndex === 0}
                      onClick={() => void handleMove(install.id, 'up')}
                    >
                      <ArrowUp size={15} aria-hidden />
                      Move earlier
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={
                        isPending || installIndex === installs.length - 1
                      }
                      onClick={() => void handleMove(install.id, 'down')}
                    >
                      <ArrowDown size={15} aria-hidden />
                      Move later
                    </Button>
                  </div>
                </div>
              );
            })()
          : null}
        <Dialog.Actions>
          <Dialog.Close>Done</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Root>
    </div>
  );
}
