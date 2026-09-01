import { MessageCircleIcon } from 'lucide-react';

export const TIMELINE_EMOTICONS = ['❤️', '🔥', '😍', '👏', '😭', '😮'];

export function TimelineReactionBar({
  clock,
  commentsEnabled,
  signedIn,
  busy,
  commentOpen,
  onReact,
  onComment,
}: {
  clock: string;
  commentsEnabled: boolean;
  signedIn: boolean;
  busy: boolean;
  commentOpen: boolean;
  onReact: (emoticon: string) => void;
  onComment: () => void;
}) {
  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-2"
      aria-label={`React at ${clock}`}
    >
      <span className="text-xs font-semibold text-white/70 tabular-nums">
        At {clock}
      </span>
      {TIMELINE_EMOTICONS.map((emoticon) => (
        <button
          key={emoticon}
          type="button"
          className="rounded-full bg-black/35 px-2 py-1 text-base transition-transform hover:scale-110 disabled:opacity-50"
          onClick={() => onReact(emoticon)}
          disabled={busy || !commentsEnabled || !signedIn}
          aria-label={`Add ${emoticon} at ${clock}`}
        >
          {emoticon}
        </button>
      ))}
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white/85 transition-colors hover:bg-black/55"
        onClick={onComment}
        aria-expanded={commentOpen}
        aria-label={`Comment at ${clock}`}
      >
        <MessageCircleIcon size={14} aria-hidden />
        Comment
      </button>
    </div>
  );
}
