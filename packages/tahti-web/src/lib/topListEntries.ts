export function formatListenCount(value: number): string {
  return `${value.toLocaleString()} ${value === 1 ? 'listen' : 'listens'}`;
}

export function formatPlayCount(value: number): string {
  return `${value.toLocaleString()} ${value === 1 ? 'play' : 'plays'}`;
}

export function rankingBucketTitle(bucket: string): string {
  return bucket.toLowerCase().replaceAll('_', ' ');
}
