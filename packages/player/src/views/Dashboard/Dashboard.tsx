import isEmpty from 'lodash-es/isEmpty';
import { FC, useMemo } from 'react';

import { useTranslation } from '@nuclearplayer/i18n';
import type { DashboardProvider } from '@nuclearplayer/plugin-sdk';
import { Loader, ViewShell } from '@nuclearplayer/ui';

import { useProviders } from '../../hooks/useProviders';
import { useStartupStore } from '../../stores/startupStore';
import { DashboardEmptyState } from './components/DashboardEmptyState';
import { TopArtistsWidget } from './components/TopArtistsWidget';
import { DASHBOARD_WIDGETS, DashboardWidgetEntry } from './dashboardWidgets';

const DashboardContent: FC<{
  isStartingUp: boolean;
  hasTopArtists: boolean;
  activeWidgets: DashboardWidgetEntry[];
}> = ({ isStartingUp, hasTopArtists, activeWidgets }) => {
  if (isStartingUp) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader data-testid="dashboard-loader" size="xl" />
      </div>
    );
  }

  if (!hasTopArtists && isEmpty(activeWidgets)) {
    return <DashboardEmptyState />;
  }

  return (
    <>
      {hasTopArtists && <TopArtistsWidget />}
      {activeWidgets.map(({ capability, component: Widget }) => (
        <Widget key={capability} />
      ))}
    </>
  );
};

export const Dashboard: FC = () => {
  const { t } = useTranslation('dashboard');
  const isStartingUp = useStartupStore((state) => state.isStartingUp);
  const providers = useProviders('dashboard') as DashboardProvider[];

  const activeWidgets = useMemo(() => {
    const capabilities = new Set(
      providers.flatMap((provider) => provider.capabilities),
    );

    return DASHBOARD_WIDGETS.filter((widget) =>
      capabilities.has(widget.capability),
    );
  }, [providers]);
  const hasTopArtists = providers.some((provider) =>
    provider.capabilities.includes('topArtists'),
  );

  return (
    <ViewShell data-testid="dashboard-view" title={t('title')}>
      <DashboardContent
        isStartingUp={isStartingUp}
        hasTopArtists={hasTopArtists}
        activeWidgets={activeWidgets}
      />
    </ViewShell>
  );
};
