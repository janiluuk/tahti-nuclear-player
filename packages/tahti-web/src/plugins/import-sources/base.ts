import {
  fetchConnectionStatus,
  oauthStartUrl,
  type SourceDef,
} from '../../api/sources';
import type { ImportSourcePlugin } from './types';

export function importSourceBase(def: SourceDef): ImportSourcePlugin {
  return {
    ...def,
    oauthUrl: def.oauthStartPath ? oauthStartUrl(def.oauthStartPath) : null,
    checkStatus: () => fetchConnectionStatus(def.id),
  };
}
