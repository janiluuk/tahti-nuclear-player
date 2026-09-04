import { RadioIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button, PluginStoreItem } from '@tahti-player/ui';

import {
  fetchMeIntegrations,
  installMeIntegration,
  lastFmOauthStartUrl,
  uninstallMeIntegration,
} from '../../api/integrations';
import { isForceMock } from '../../api/mode';

const ADDON = {
  id: 'lastfm',
  name: 'Last.fm',
  author: 'Scrobble',
  description:
    'When a Tahti track counts as a listen, submit it to your Last.fm profile. Charts and recommendations are out of scope — this is scrobbling only.',
};

export function LastFmAddonCard() {
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const { data } = await fetchMeIntegrations();
      const row = data.find((entry) => entry.slug === 'lastfm');
      setConnected(Boolean(row?.connected || row?.installed));
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    void refresh();
    const params = new URLSearchParams(window.location.search);
    const status = params.get('lastfm');
    if (!status) {
      return;
    }

    if (status === 'ok') {
      toast.success('Last.fm scrobbling connected.');
      void refresh();
    } else {
      toast.error(
        status === 'unconfigured'
          ? 'Last.fm is not configured on the server yet.'
          : status === 'login'
            ? 'Sign in again, then reconnect Last.fm.'
            : 'Could not connect Last.fm. Try again.',
      );
    }
    params.delete('lastfm');
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', next);
  }, []);

  const connect = () => {
    if (isForceMock()) {
      setBusy(true);
      void installMeIntegration('lastfm', {}).then((result) => {
        setBusy(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        setConnected(true);
        toast.success('Last.fm scrobbling connected (mock).');
      });
      return;
    }
    const returnTo = `${window.location.origin}/settings/plugin-store`;
    window.location.assign(lastFmOauthStartUrl(returnTo));
  };

  const remove = async () => {
    setBusy(true);
    const result = await uninstallMeIntegration('lastfm');
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setConnected(false);
    toast.success('Last.fm disconnected.');
  };

  return (
    <PluginStoreItem
      icon={<RadioIcon size={22} aria-hidden />}
      name={ADDON.name}
      author={ADDON.author}
      description={ADDON.description}
      categories={['Scrobbling']}
      isInstalled={connected}
      onInstall={connect}
      accessory={
        connected ? (
          <Button
            size="sm"
            variant="text"
            intent="danger"
            disabled={busy}
            onClick={() => void remove()}
          >
            Disconnect
          </Button>
        ) : null
      }
      labels={{
        install: 'Connect',
        installed: 'Connected',
      }}
    />
  );
}
