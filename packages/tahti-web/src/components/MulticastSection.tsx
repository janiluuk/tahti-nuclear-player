import {
  Cast,
  Facebook,
  ImageIcon,
  Instagram,
  Music2Icon,
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
  Tabs,
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
import { StreamOverlayEditor } from './StreamOverlayEditor';

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

function tabLabel(Icon: LucideIcon, label: string) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} aria-hidden />
      {label}
    </span>
  );
}

type EditingState = {
  providerId: MulticastProviderId;
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
  const isCustom = state.providerId === 'CUSTOM';
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
    void createRtmpTarget({
      provider: state.providerId,
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
          : `Add ${provider?.label}`}
      </Dialog.Title>
      <Dialog.Description>
        {isCustom
          ? 'Paste the RTMP address and stream key for this destination.'
          : `Paste the stream key from your ${provider?.label} dashboard.`}
      </Dialog.Description>
      <div className="mt-4 flex flex-col gap-3">
        {error && (
          <p className="text-accent-red text-sm" role="alert">
            {error}
          </p>
        )}
        <Input
          label="Label"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={provider?.label}
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
                    : (testResult.error ?? 'Could not reach the destination.')
                  : testResult.error}
              </p>
            )}
          </div>
        )}
      </div>
      <Dialog.Actions>
        <Dialog.Close>Close</Dialog.Close>
        {savedTarget && (
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
      {loading ? (
        <p className="text-foreground-secondary text-sm">
          Loading destinations…
        </p>
      ) : (
        <CardGrid className="grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {multicastProviders.map((provider) => {
            const target = targets.find((t) => t.provider === provider.id);
            const Icon = PROVIDER_ICON[provider.id];
            return (
              <div key={provider.id} className="relative">
                <Card
                  title={provider.label}
                  subtitle={
                    target
                      ? `${target.label || provider.label} · key ···${target.keyLast4 ?? 'hidden'}`
                      : 'Not configured'
                  }
                  className="w-full max-w-none"
                  image={
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon size={40} aria-hidden />
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
                      target ? (target.enabled ? 'green' : 'yellow') : undefined
                    }
                  >
                    {target
                      ? target.enabled
                        ? 'Enabled'
                        : 'Disabled'
                      : 'Not set up'}
                  </Badge>
                  <div className="pointer-events-auto flex gap-1">
                    {target && (
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={
                          target.enabled
                            ? `Disable ${provider.label}`
                            : `Enable ${provider.label}`
                        }
                        title={target.enabled ? 'Disable' : 'Enable'}
                        onClick={(event) => {
                          event.stopPropagation();
                          void patchRtmpTarget(target.id, {
                            enabled: !target.enabled,
                          }).then((result) => {
                            if (result.ok) {
                              reload();
                            }
                          });
                        }}
                      >
                        <PowerIcon size={14} aria-hidden />
                      </Button>
                    )}
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
  return (
    <Tabs
      items={[
        {
          id: 'destinations',
          label: tabLabel(Cast, 'Destinations'),
          content: <DestinationsGrid />,
        },
        {
          id: 'overlay',
          label: tabLabel(ImageIcon, 'Overlay'),
          content: <StreamOverlayEditor />,
        },
      ]}
    />
  );
}
