import type { StreamCandidate, Track } from '@tahti-player/model';

import { isStreamExpired, streamingHost } from '../streamingHost';

export const candidatesForTrack = async (
  track: Track,
): Promise<StreamCandidate[] | undefined> => {
  const cached = track.streamCandidates;
  if (cached?.length && !cached.some(isStreamExpired)) {
    return cached;
  }

  const result = await streamingHost.resolveCandidatesForTrack(track);
  if (result.success) {
    return result.candidates;
  }
  return undefined;
};
