import type { FetchMeta } from '../../api/client';
import type { ConnectionStatus, SourceDef } from '../../api/sources';

/**
 * A place a release/catalog item can come from. Wraps a `SourceDef` (id,
 * name, description, kind — the metadata `api/sources.ts` already
 * exports) with the one behavior every source actually has in common:
 * checking whether it's connected. The bespoke per-source logic (OAuth
 * callbacks, SoundCloud track listing, Spotify/hearthis search, Google
 * Drive import jobs, ...) stays in `api/sources.ts`, where it shares that
 * file's request plumbing with everything else — see
 * PLUGIN-STORE-PLAN.md §5 for why this extraction stops at the shared
 * connection-status contract rather than forcing all ten sources into one
 * `start/status/import` shape that doesn't actually fit search/tool kinds.
 */
export type ImportSourcePlugin = SourceDef & {
  /** Full OAuth authorize URL, or null if this source isn't OAuth-based. */
  oauthUrl: string | null;
  /** Live connection/configuration state for this source. */
  checkStatus(): Promise<{ data: ConnectionStatus; meta: FetchMeta }>;
};
