export type BroadcastPresenceKind = 'live' | 'rotation' | 'preview' | 'offline';

export type BroadcastPresence = {
  kind: BroadcastPresenceKind;
  label: string;
};

/** Channel `LIVE` is also used for 24/7 rotation. Only an ingest signal
 * plus LIVE is a real broadcast. */
export function resolveBroadcastPresence(input: {
  signalConnected: boolean;
  channelState?: string | null;
}): BroadcastPresence {
  if (input.signalConnected && input.channelState === 'LIVE') {
    return { kind: 'live', label: 'Live now' };
  }
  if (input.signalConnected && input.channelState === 'PREVIEW') {
    return { kind: 'preview', label: 'Preview' };
  }
  if (input.channelState === 'LIVE') {
    return { kind: 'rotation', label: '24/7 playing' };
  }
  return { kind: 'offline', label: 'Broadcast offline' };
}
