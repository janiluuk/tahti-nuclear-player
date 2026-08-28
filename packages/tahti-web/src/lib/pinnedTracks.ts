export function isPinned(item: {
  pinnedAt?: string | null;
  pinned?: boolean;
}): boolean {
  return Boolean(item.pinnedAt) || item.pinned === true;
}

export function countPinnedTracks(
  items: Array<{ pinnedAt?: string | null; pinned?: boolean }>,
): number {
  return items.filter(isPinned).length;
}

export function sortPinnedFirst<
  T extends { pinnedAt?: string | null; pinned?: boolean },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aPinned = isPinned(a) ? new Date(a.pinnedAt ?? 0).getTime() || 1 : 0;
    const bPinned = isPinned(b) ? new Date(b.pinnedAt ?? 0).getTime() || 1 : 0;
    if (aPinned === 0 && bPinned === 0) {
      return 0;
    }
    return bPinned - aPinned;
  });
}
