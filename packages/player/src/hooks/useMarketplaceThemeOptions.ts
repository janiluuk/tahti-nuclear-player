import { useMemo } from 'react';

import { SelectOption } from '@tahti-player/ui';

import { useThemeStore } from '../stores/themeStore';

export const useMarketplaceThemeOptions = (): SelectOption[] => {
  const marketplaceThemes = useThemeStore((state) => state.marketplaceThemes);
  return useMemo(
    () =>
      marketplaceThemes
        .filter((theme) => theme.id)
        .map((theme) => ({
          id: theme.id!,
          label: theme.name,
        })),
    [marketplaceThemes],
  );
};
