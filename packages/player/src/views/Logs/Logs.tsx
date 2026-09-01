import { useTranslation } from '@tahti-player/i18n';
import { LogViewer, ViewShell } from '@tahti-player/ui';

import { useLogExport } from '../../hooks/useLogExport';
import { useLogStream } from '../../hooks/useLogStream';

export const Logs = () => {
  const { t } = useTranslation('logs');
  const { logs, scopes, targets, clearLogs } = useLogStream();
  void targets;
  const { exportLogs, openLogFolder } = useLogExport(logs);

  return (
    <ViewShell title={t('title')}>
      <LogViewer
        logs={logs}
        scopes={scopes}
        onClear={clearLogs}
        onExport={exportLogs}
        onOpenLogFolder={openLogFolder}
      />
    </ViewShell>
  );
};
