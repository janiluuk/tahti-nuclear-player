function filePart(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'stream'
  );
}

/** Downloads a one-track M3U pointing at a live stream URL (Icecast/HLS),
 * so listeners can open it in VLC or another desktop radio app. */
export function downloadM3uPlaylist({
  title,
  streamUrl,
  fileSlug,
}: {
  title: string;
  streamUrl: string;
  fileSlug: string;
}) {
  const content = `#EXTM3U\n#EXTINF:-1,${title}\n${streamUrl}\n`;
  const blob = new Blob([content], { type: 'audio/x-mpegurl' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filePart(fileSlug)}.m3u`;
  link.click();
  URL.revokeObjectURL(url);
}
