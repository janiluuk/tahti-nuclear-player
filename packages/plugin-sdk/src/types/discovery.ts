import type { Track } from '@tahti-player/model';

import type { ProviderDescriptor } from './providers';

export type DiscoveryOptions = {
  variety: number;
  limit?: number;
};

export type DiscoveryProvider = ProviderDescriptor<'discovery'> & {
  getRecommendations: (
    context: Track[],
    options: DiscoveryOptions,
  ) => Promise<Track[]>;
};

export type DiscoveryHost = {
  getRecommendations: (
    context: Track[],
    options: DiscoveryOptions,
    providerId?: string,
  ) => Promise<Track[]>;
};
