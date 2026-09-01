import '@nuclearplayer/tailwind-config';
import '@nuclearplayer/themes';
import '@nuclearplayer/ui';
import './styles.css';

const el = document.getElementById('root');
if (!el) {
  throw new Error('#root missing');
}

const { mountTahtiApp } = await import('./TahtiApp');
void mountTahtiApp(el);
