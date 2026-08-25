import { acoustIdProvider } from './acoustid';
import type { FingerprintProvider } from './types';

export { acoustIdProvider } from './acoustid';
export type { FingerprintOutcome, FingerprintProvider } from './types';

export const fingerprintProviders: FingerprintProvider[] = [acoustIdProvider];
