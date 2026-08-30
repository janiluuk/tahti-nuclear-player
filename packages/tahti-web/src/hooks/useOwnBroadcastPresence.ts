import { useCallback, useEffect } from 'react';

import { fetchSignalStatus } from '../api/broadcast';
import { resolveBroadcastPresence } from '../lib/broadcastPresence';
import { useBroadcastPresenceStore } from '../stores/broadcastPresenceStore';

export function useOwnBroadcastPresence({
  enabled,
  channelState,
  refreshWhen,
}: {
  enabled: boolean;
  channelState?: string | null;
  refreshWhen?: boolean;
}) {
  const signalConnected = useBroadcastPresenceStore((s) => s.signalConnected);
  const setSignalConnected = useBroadcastPresenceStore(
    (s) => s.setSignalConnected,
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      setSignalConnected(false);
      return;
    }
    const { data } = await fetchSignalStatus();
    setSignalConnected(Boolean(data.connected));
  }, [enabled, setSignalConnected]);

  useEffect(() => {
    if (!enabled) {
      setSignalConnected(false);
      return;
    }
    void refresh();
    const onResume = () => {
      if (document.visibilityState === 'hidden') {
        return;
      }
      void refresh();
    };
    window.addEventListener('focus', onResume);
    document.addEventListener('visibilitychange', onResume);
    return () => {
      window.removeEventListener('focus', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, [enabled, refresh, setSignalConnected]);

  useEffect(() => {
    if (enabled && refreshWhen) {
      void refresh();
    }
  }, [enabled, refresh, refreshWhen]);

  return {
    ...resolveBroadcastPresence({ signalConnected, channelState }),
    signalConnected,
    refresh,
  };
}
