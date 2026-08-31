import {
  Cast,
  Facebook,
  Instagram,
  Music2Icon,
  PlusIcon,
  PowerIcon,
  RadioTowerIcon,
  SettingsIcon,
  Twitch,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardGrid,
  Dialog,
  Input,
} from '@nuclearplayer/ui';

import {
  createRtmpTarget,
  deleteRtmpTarget,
  fetchRtmpTargets,
  patchRtmpTarget,
  testRtmpTarget,
  type RtmpTarget,
} from '../api/broadcast';
import {
  multicastProviders,
  type MulticastProviderId,
} from '../plugins/multicast';

const PROVIDER_ICON: Record<MulticastProviderId, LucideIcon> = {
  YOUTUBE: Youtube,
  TWITCH: Twitch,
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  TIKTOK: Music2Icon,
  MIXCLOUD_LIVE: RadioTowerIcon,
  KICK: Cast,
  CUSTOM: Cast,
};

type EditingState = {
  providerId: MulticastProviderId | null;
  target: RtmpTarget | null;
};

function DestinationDialog({
  state,
  onClose,
  onSaved,
  onDeleted,
}: {
  state: EditingState;
  onClose: () => void;
  onSaved: (target: RtmpTarget) => void;
  onDeleted: () => void;
}) {
  const provider = multicastProviders.find((p) => p.id === state.providerId);
  const [providerId, setProviderId] = useState(state.providerId);
  const selectedProvider = multicastProviders.find((p) => p.id === providerId);
  const isCustom = providerId === 'CUSTOM';
  const [label, setLabel] = useState(
    state.target?.label ?? provider?.label ?? '',
  );
  const [streamKey, setStreamKey] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState(state.target?.rtmpUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<
    | { ok: true; reachable: boolean; error?: string }
    | { ok: false; error: string }
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTarget, setSavedTarget] = useState(state.target);

  const save = () => {
    setSaving(true);
    setError(null);
    if (savedTarget) {
      void patchRtmpTarget(savedTarget.id, {
        label: label.trim() || undefined,
        ...(streamKey.trim() ? { streamKey: streamKey.trim() } : {}),
      }).then((result) => {
        setSaving(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const updated = {
          ...savedTarget,
          label: label.trim() || savedTarget.label,
        };
        setSavedTarget(updated);
        setStreamKey('');
        onSaved(updated);
      });
      return;
    }
    if (!providerId) {
      setSaving(false);
      return;
    }
    void createRtmpTarget({
      provider: providerId,
      label: label.trim(),
      streamKey: streamKey.trim(),
      rtmpUrl: isCustom ? rtmpUrl.trim() : undefined,
    }).then((result) => {
      setSaving(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedTarget(result.target);
      setStreamKey('');
      onSaved(result.target);
    });
  };

  const runTest = () => {
    if (!savedTarget) {
      return;
    }
    setTesting(true);
    setTestResult(null);
    void testRtmpTarget(savedTarget.id).then((result) => {
      setTesting(false);
      setTestResult(result);
    });
  };

  return (
    <Dialog.Root isOpen onClose={onClose} className="max-w-lg">
      <Dialog.Title>
        {savedTarget
          ? `Configure ${provider?.label}`
          : providerId
            ? `Add ${selectedProvider?.label}`
            : 'Add multicast source'}
      </Dialog.Title>
      <Dialog.Description>
        {!providerId
          ? 'Choose a destination to configure.'
          : isCustom
            ? 'Paste the RTMP address and stream key for this destination.'
            : `Paste the stream key from your ${selectedProvider?.label} dashboard.`}
      </Dialog.Description>
      <div className="mt-4 flex flex-col gap-3">
        {!providerId ? (
          <CardGrid className="grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
            {multicastProviders.map((option) => {
              const Icon = PROVIDER_ICON[option.id];
              return (
                <Card
                  key={option.id}
                  title={option.label}
                  subtitle="Select to configure"
                  image={
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon size={34} aria-hidden />
                    </div>
                  }
                  onClick={() => {
                    setProviderId(option.id);
                    setLabel(option.label);
                  }}
                />
              );
            })}
          </CardGrid>
        ) : (
          <>
            {!savedTarget && (
              <Button
                size="sm"
                variant="text"
                className="self-start"
                onClick={() => setProviderId(null)}
              >
                ← Choose another source
              </Button>
            )}
            {error && (
              <p className="text-accent-red text-sm" role="alert">
                {error}
              </p>
            )}
            <Input
              label="Label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={selectedProvider?.label}
            />
            <Input
              label={savedTarget ? 'New stream key' : 'Stream key'}
              type="password"
              autoComplete="off"
              value={streamKey}
              onChange={(event) => setStreamKey(event.target.value)}
              placeholder={
                savedTarget
                  ? `Leave blank to keep the current key (···${savedTarget.keyLast4 ?? '····'})`
                  : undefined
              }
            />
            {isCustom && (
              <Input
                label="RTMP address"
                value={rtmpUrl}
                onChange={(event) => setRtmpUrl(event.target.value)}
                placeholder="rtmp://example.com/live"
                disabled={Boolean(savedTarget)}
              />
            )}
            {savedTarget && (
              <div className="border-border flex flex-wrap items-center gap-2 rounded-md border p-3">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={testing}
                  onClick={runTest}
                >
                  {testing ? 'Testing…' : 'Test connection'}
                </Button>
                <Button
                  size="sm"
                  variant={savedTarget.enabled ? 'secondary' : undefined}
                  onClick={() => {
                    void patchRtmpTarget(savedTarget.id, {
                      enabled: !savedTarget.enabled,
                    }).then((result) => {
                      if (!result.ok) {
                        setError(result.error);
                        return;
                      }
                      const updated = {
                        ...savedTarget,
                        enabled: !savedTarget.enabled,
                      };
                      setSavedTarget(updated);
                      onSaved(updated);
                    });
                  }}
                >
                  {savedTarget.enabled ? 'Disable' : 'Enable'}
                </Button>
                {testResult && (
                  <p
                    className={
                      testResult.ok && testResult.reachable
                        ? 'text-accent-green w-full text-xs'
                        : 'text-accent-red w-full text-xs'
                    }
                    role="status"
                  >
                    {testResult.ok
                      ? testResult.reachable
                        ? 'Reachable — the destination is accepting connections.'
                        : (testResult.error ??
                          'Could not reach the destination.')
                      : testResult.error}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Dialog.Actions>
        <Dialog.Close>Close</Dialog.Close>
        {providerId && savedTarget && (
          <Button
            intent="danger"
            variant="secondary"
            disabled={deleting}
            onClick={() => {
              setDeleting(true);
              void deleteRtmpTarget(savedTarget.id).then((result) => {
                setDeleting(false);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                onDeleted();
              });
            }}
          >
            {deleting ? 'Removing…' : 'Remove'}
          </Button>
        )}
        {providerId && (
          <Button
            disabled={
              saving || !label.trim() || (!savedTarget && !streamKey.trim())
            }
            onClick={save}
          >
            {saving
              ? 'Saving…'
              : savedTarget
                ? 'Save changes'
                : 'Add destination'}
          </Button>
        )}
      </Dialog.Actions>
    </Dialog.Root>
  );
}

function DestinationsGrid() {
  const [targets, setTargets] = useState<RtmpTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const reload = () => {
    void fetchRtmpTargets().then((r) => {
      setTargets(r.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground-secondary text-sm">
          Configure the destinations that should receive your live broadcast.
        </p>
        <Button
          size="icon-sm"
          aria-label="Add multicast source"
          title="Add multicast source"
          onClick={() => setEditing({ providerId: null, target: null })}
        >
          <PlusIcon size={17} aria-hidden />
        </Button>
      </div>
      {loading ? (
        <p className="text-foreground-secondary text-sm">
          Loading destinations…
        </p>
      ) : (
        <CardGrid className="grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {multicastProviders.map((provider) => {
            const target = targets.find(
              (candidate) => candidate.provider === provider.id,
            );
            const active = target?.enabled ?? false;
            const Icon = PROVIDER_ICON[provider.id];
            return (
              <div key={provider.id} className="relative">
                <Card
                  title={provider.label}
                  subtitle={
                    target
                      ? `${target.label || provider.label} · ${active ? 'enabled' : 'disabled'}`
                      : 'Not configured · Add destination'
                  }
                  className={`w-full max-w-none ${!target ? 'border-dashed opacity-75' : !active ? 'border-border/70 bg-transparent opacity-60 grayscale' : ''}`}
                  image={
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon
                        size={40}
                        aria-hidden
                        className={!active ? 'opacity-60' : undefined}
                      />
                    </div>
                  }
                  onClick={() =>
                    setEditing({
                      providerId: provider.id,
                      target: target ?? null,
                    })
                  }
                />
                <div className="pointer-events-none absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                  <Badge
                    variant="pill"
                    color={
                      target ? (active ? 'green' : 'secondary') : 'secondary'
                    }
                  >
                    {target
                      ? active
                        ? 'Enabled'
                        : 'Disabled'
                      : 'Not configured'}
                  </Badge>
                  <div className="pointer-events-auto flex gap-1">
                    {target ? (
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={
                          active
                            ? `Disable ${provider.label}`
                            : `Enable ${provider.label}`
                        }
                        title={active ? 'Disable' : 'Enable'}
                        onClick={(event) => {
                          event.stopPropagation();
                          void patchRtmpTarget(target.id, {
                            enabled: !active,
                          }).then((result) => {
                            if (result.ok) {
                              reload();
                            }
                          });
                        }}
                      >
                        <PowerIcon size={14} aria-hidden />
                      </Button>
                    ) : null}
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      aria-label={`Configure ${provider.label}`}
                      title="Configure"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditing({
                          providerId: provider.id,
                          target: target ?? null,
                        });
                      }}
                    >
                      <SettingsIcon size={14} aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardGrid>
      )}

      {editing && (
        <DestinationDialog
          state={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
          onDeleted={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

/** Manage → Multicast: destinations as thumbnails (Sources-style) plus the
 * shared stream-overlay editor, replacing the old always-visible
 * add-destination form + plain provider list. */
export function MulticastSection() {
  return <DestinationsGrid />;
}
