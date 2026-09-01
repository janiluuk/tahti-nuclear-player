import '@nuclearplayer/tailwind-config';
import '@nuclearplayer/themes';
import '@nuclearplayer/i18n';

import { mountTahtiApp } from '../../tahti-web/src/TahtiApp';

import '../../tahti-web/src/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root missing');
}

await mountTahtiApp(rootElement);
