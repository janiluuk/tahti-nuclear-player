import '@tahti-player/tailwind-config';
import '@tahti-player/themes';
import '@tahti-player/ui';
import './styles.css';

const el = document.getElementById('root');
if (!el) {
  throw new Error('#root missing');
}

const { mountTahtiApp } = await import('./TahtiApp');
void mountTahtiApp(el);
