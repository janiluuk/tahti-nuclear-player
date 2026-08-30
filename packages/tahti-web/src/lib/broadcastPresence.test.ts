import { describe, expect, it } from 'vitest';

import { resolveBroadcastPresence } from './broadcastPresence';

describe('resolveBroadcastPresence', () => {
  it('treats LIVE without an ingest as 24/7 rotation, not a live broadcast', () => {
    expect(
      resolveBroadcastPresence({
        signalConnected: false,
        channelState: 'LIVE',
      }),
    ).toEqual({ kind: 'rotation', label: '24/7 playing' });
  });

  it('shows Live now only when ingest is connected and the channel is LIVE', () => {
    expect(
      resolveBroadcastPresence({
        signalConnected: true,
        channelState: 'LIVE',
      }),
    ).toEqual({ kind: 'live', label: 'Live now' });
  });

  it('does not call a preview signal Live now', () => {
    expect(
      resolveBroadcastPresence({
        signalConnected: true,
        channelState: 'PREVIEW',
      }),
    ).toEqual({ kind: 'preview', label: 'Preview' });
  });

  it('is offline when the channel is not live', () => {
    expect(
      resolveBroadcastPresence({
        signalConnected: false,
        channelState: 'OFFLINE',
      }),
    ).toEqual({ kind: 'offline', label: 'Broadcast offline' });
  });
});
