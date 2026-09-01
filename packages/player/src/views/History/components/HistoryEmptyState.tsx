import { HistoryIcon } from 'lucide-react';
import { FC } from 'react';

import { useTranslation } from '@tahti-player/i18n';
import { EmptyState } from '@tahti-player/ui';

export const HistoryEmptyState: FC = () => {
  const { t } = useTranslation('history');

  return (
    <EmptyState
      data-testid="history-empty-state"
      icon={<HistoryIcon size={48} />}
      title={t('empty')}
      description={t('emptyDescription')}
      className="flex-1"
    />
  );
};
