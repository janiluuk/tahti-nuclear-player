const TIMESTAMP_PREFIX = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*/;

export function clockToSeconds(clock: string): number | null {
  const parts = clock.split(':').map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) {
    return null;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

export function formatTimedCommentBody(clock: string, text: string): string {
  return `[${clock}] ${text}`;
}

export function parseTimedComment(body: string): {
  timestamp: string | null;
  seconds: number | null;
  text: string;
} {
  const match = TIMESTAMP_PREFIX.exec(body);
  if (!match) {
    return { timestamp: null, seconds: null, text: body };
  }
  const timestamp = match[1] ?? null;
  return {
    timestamp,
    seconds: timestamp ? clockToSeconds(timestamp) : null,
    text: body.slice(match[0].length),
  };
}
