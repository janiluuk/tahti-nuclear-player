export type AdminOrphanPageTabId = 'radio-station-suggestions';

export type AdminOrphanPageTabItem = {
  id: AdminOrphanPageTabId;
  label: string;
};

/** Real admin pages that shipped with no nav entry and no in-app link — see
 * NAVIGATION-SITEMAP.md. Gathered here as tabs, same convention as
 * AdminModerationView, so nothing built stays permanently unreachable. */
export const ADMIN_ORPHAN_PAGE_TABS: AdminOrphanPageTabItem[] = [
  { id: 'radio-station-suggestions', label: 'Radio station suggestions' },
];

export const DEFAULT_ADMIN_ORPHAN_PAGE_TAB: AdminOrphanPageTabId =
  'radio-station-suggestions';

export function isAdminOrphanPageTabId(
  value: string | undefined,
): value is AdminOrphanPageTabId {
  return Boolean(value && ADMIN_ORPHAN_PAGE_TABS.some((t) => t.id === value));
}
