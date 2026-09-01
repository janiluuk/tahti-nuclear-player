import { FC } from 'react';

import { useTranslation } from '@tahti-player/i18n';
import type { Track } from '@tahti-player/model';
import { CenteredLoader, TahtiJam } from '@tahti-player/ui';

type SearchDrawerContentProps = {
  isError: boolean;
  isSuccess: boolean;
  tracks: Track[];
  onAdd: (track: Track) => void;
};

export const SearchDrawerContent: FC<SearchDrawerContentProps> = ({
  isError,
  isSuccess,
  tracks,
  onAdd,
}) => {
  const { t } = useTranslation('remote');

  if (isError) {
    return (
      <TahtiJam.SearchDrawer.Error
        labels={{
          title: t('search.errorTitle'),
          description: t('search.errorDescription'),
        }}
      />
    );
  }
  if (!isSuccess) {
    return <CenteredLoader />;
  }
  if (tracks.length === 0) {
    return (
      <TahtiJam.SearchDrawer.Empty
        labels={{
          title: t('search.emptyTitle'),
          description: t('search.emptyDescription'),
        }}
      />
    );
  }
  return (
    <TahtiJam.SearchDrawer.Results>
      {tracks.map((track) => (
        <TahtiJam.SearchResultTrack
          key={`${track.source.provider}:${track.source.id}`}
          track={track}
          onAdd={onAdd}
        />
      ))}
    </TahtiJam.SearchDrawer.Results>
  );
};
