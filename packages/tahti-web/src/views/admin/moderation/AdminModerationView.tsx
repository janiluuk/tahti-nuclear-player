import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Tabs } from '@nuclearplayer/ui';

import { fetchAdminDashboard } from '../../../api/admin';
import { AdminGate } from '../../../components/AdminGate';
import { AdminNav } from '../../../components/AdminNav';
import { StudioPageHeader } from '../../../components/StudioPanel';
import { AdminMissedShowsPanel } from '../AdminMissedShowsView';
import {
  ADMIN_MODERATION_TABS,
  DEFAULT_ADMIN_MODERATION_TAB,
  isAdminModerationTabId,
  type AdminModerationTabId,
} from './moderationNav';
import { BetaTab } from './tabs/BetaTab';
import { ContentReportsTab } from './tabs/ContentReportsTab';
import { FeatureRequestsTab } from './tabs/FeatureRequestsTab';
import { RadioSubmissionsTab } from './tabs/RadioSubmissionsTab';
import { SupportTab } from './tabs/SupportTab';

function tabContent(id: AdminModerationTabId) {
  switch (id) {
    case 'support':
      return <SupportTab />;
    case 'beta':
      return <BetaTab />;
    case 'radio-submissions':
      return <RadioSubmissionsTab />;
    case 'content-reports':
      return <ContentReportsTab />;
    case 'feature-requests':
      return <FeatureRequestsTab />;
    case 'missed-shows':
      return <AdminMissedShowsPanel />;
  }
}

/** One page, one tab per review queue: Support, Beta applications, Radio
 * submissions, Selects, Content reports, Feature requests — see
 * moderationNav.ts. These used to be six standalone `/admin/*` routes; they
 * now redirect into `/admin/moderation/$tab` (router.tsx), which is the
 * canonical, addressable URL for each tab — same convention as
 * `/settings/$section` (SettingsView) and `/sources/$id` (SourcesView).
 * Headless UI's Tabs unmount inactive panels by default, so switching tabs
 * here re-fetches that queue rather than loading all six up front. */
export function AdminModerationView({ tab }: { tab?: AdminModerationTabId }) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number>();
  const active = isAdminModerationTabId(tab)
    ? tab
    : DEFAULT_ADMIN_MODERATION_TAB;
  const selectedIndex = ADMIN_MODERATION_TABS.findIndex((t) => t.id === active);

  useEffect(() => {
    void fetchAdminDashboard().then((result) => {
      setPendingCount(
        result.data.kpis.betaQueue + result.data.kpis.openTickets,
      );
    });
  }, []);

  return (
    <AdminGate>
      <div className="admin-moderation-layout mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav
          current="/admin/moderation"
          splitLayout
          moderationPendingCount={pendingCount}
        />
        <StudioPageHeader
          title="Moderation"
          subtitle="Review queues the board triages day to day — support, beta access, radio, curation, reports, and roadmap."
        />
        <Tabs
          selectedIndex={selectedIndex < 0 ? 0 : selectedIndex}
          onChange={(index) => {
            const next = ADMIN_MODERATION_TABS[index];
            if (!next) {
              return;
            }
            void navigate({
              to: '/admin/moderation/$tab',
              params: { tab: next.id },
              replace: true,
            });
          }}
          items={ADMIN_MODERATION_TABS.map((t) => ({
            id: t.id,
            label: t.label,
            content: tabContent(t.id),
          }))}
        />
      </div>
    </AdminGate>
  );
}
