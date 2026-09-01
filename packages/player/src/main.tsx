import '@tahti-player/tailwind-config';
import '@tahti-player/themes';
import '@tahti-player/i18n';

import { mountTahtiApp } from '../../tahti-web/src/TahtiApp';

import '../../tahti-web/src/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root missing');
}

await mountTahtiApp(rootElement);
