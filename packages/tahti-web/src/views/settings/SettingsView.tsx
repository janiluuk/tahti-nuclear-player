import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import type { PluginCategoryId } from '../../content/pluginStoreCategories';
import { useSettingsModalStore } from '../../stores/settingsModalStore';
import { isSettingsSectionId, type SettingsSectionId } from './settingsNav';

/** Deep link `/settings` → Nuclear SettingsPanel modal. Also the landing
 * pad for OAuth connect callbacks (see cutoverReturns.ts) — `?status=` is
 * surfaced as a toast, then dropped, same as the retired Sources page did. */
export function SettingsView({ sectionId }: { sectionId?: string }) {
  const navigate = useNavigate();
  const open = useSettingsModalStore((s) => s.open);
  const section: SettingsSectionId = isSettingsSectionId(sectionId)
    ? sectionId
    : 'account';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') as PluginCategoryId | null;
    open(section, category ?? undefined);
    const status = params.get('status');
    if (status === 'connected') {
      toast.success('Connected.');
    } else if (status === 'login') {
      toast.info('Sign in to Tahti first, then connect.');
    } else if (status) {
      toast.error('Could not connect. Try again.');
    }
    void navigate({ to: '/', replace: true });
  }, [navigate, open, section]);

  return null;
}
