import { useNavigate } from '@tanstack/react-router';
import { RadioIcon } from 'lucide-react';

import { Tabs } from '@tahti-player/ui';

import { AdminGate } from '../../../components/AdminGate';
import { AdminPageLayout } from '../../../components/AdminNav';
import { StudioPageHeader } from '../../../components/StudioPanel';
import {
  ADMIN_ORPHAN_PAGE_TABS,
  DEFAULT_ADMIN_ORPHAN_PAGE_TAB,
  isAdminOrphanPageTabId,
  type AdminOrphanPageTabId,
} from './orphanPagesNav';
import { RadioStationSuggestionsTab } from './tabs/RadioStationSuggestionsTab';

function tabContent(id: AdminOrphanPageTabId) {
  switch (id) {
    case 'radio-station-suggestions':
      return <RadioStationSuggestionsTab />;
  }
}

/** One admin page, one tab per shipped page that had no nav entry and no
 * in-app link — see NAVIGATION-SITEMAP.md. Same convention as
 * AdminModerationView: each tab is addressable at
 * `/admin/orphan-pages/$tab`, and the retired standalone route redirects
 * here (router.tsx). */
export function AdminOrphanPagesView({ tab }: { tab?: AdminOrphanPageTabId }) {
  const navigate = useNavigate();
  const active = isAdminOrphanPageTabId(tab)
    ? tab
    : DEFAULT_ADMIN_ORPHAN_PAGE_TAB;
  const selectedIndex = ADMIN_ORPHAN_PAGE_TABS.findIndex(
    (t) => t.id === active,
  );

  return (
    <AdminGate>
      <div className="admin-page-layout px-1 py-2">
        <AdminPageLayout current="/admin/orphan-pages">
          <div className="flex max-w-5xl flex-col gap-6">
            <StudioPageHeader
              title="Orphan pages"
              subtitle="Real pages that shipped without a menu entry or an in-app link. Gathered here so nothing built stays permanently unreachable."
            />
            <Tabs.Root
              selectedIndex={selectedIndex < 0 ? 0 : selectedIndex}
              onChange={(index) => {
                void navigate({
                  to: '/admin/orphan-pages/$tab',
                  params: { tab: ADMIN_ORPHAN_PAGE_TABS[index].id },
                  replace: true,
                });
              }}
              listClassName="flex flex-wrap gap-3"
              tabClassName="h-8 rounded-md border border-border px-2.5 text-xs font-semibold tracking-wide uppercase"
            >
              <Tabs.List aria-label="Orphan pages">
                {ADMIN_ORPHAN_PAGE_TABS.map((item) => (
                  <Tabs.Tab key={item.id}>
                    <RadioIcon size={14} aria-hidden />
                    {item.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>
            {tabContent(active)}
          </div>
        </AdminPageLayout>
      </div>
    </AdminGate>
  );
}
