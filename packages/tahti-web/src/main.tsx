import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@nuclearplayer/tailwind-config';
import '@nuclearplayer/themes';
import '@nuclearplayer/ui';

import { useThemeStore } from './plugins/themes';
import { router } from './router';

import './styles.css';

const boot = Promise.resolve(useThemeStore.persist.rehydrate()).then(() => {
  useThemeStore.getState().init();
});
const el = document.getElementById('root');
if (!el) {
  throw new Error('#root missing');
}

void boot.then(() => {
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});
