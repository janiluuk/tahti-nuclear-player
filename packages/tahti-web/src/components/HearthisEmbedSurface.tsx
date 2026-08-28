import { embedSrcFor } from '../lib/embedSrc';

type Props = {
  embedUri: string;
  title: string;
  autoplay: boolean;
  compact?: boolean;
};

export function HearthisEmbedSurface({
  embedUri,
  title,
  autoplay,
  compact = false,
}: Props) {
  const src = embedSrcFor('HEARTHIS', embedUri);

  if (!src) {
    return null;
  }

  return (
    <iframe
      key={`${embedUri}-${autoplay ? 'playing' : 'paused'}`}
      title={`${title} — hearthis.at player`}
      src={src.replace('autoplay=0', `autoplay=${autoplay ? '1' : '0'}`)}
      width="100%"
      height={compact ? 96 : 150}
      className="border-border block w-full rounded-lg border"
      allow="autoplay"
      loading="lazy"
    />
  );
}
