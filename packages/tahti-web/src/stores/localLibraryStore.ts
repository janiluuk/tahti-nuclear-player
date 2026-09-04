import { create } from 'zustand';

import type { TahtiPlayable } from '../api/types';

export type LocalLibraryTrack = {
  id: string;
  title: string;
  artist: string;
  fileName: string;
  objectUrl: string;
  addedAt: string;
};

type LocalLibraryState = {
  tracks: LocalLibraryTrack[];
  addFiles: (files: readonly File[]) => LocalLibraryTrack[];
  remove: (id: string) => void;
  clear: () => void;
};

const AUDIO_PREFIX = 'audio/';
const AUDIO_EXTENSION = /\.(aac|aif|aiff|flac|m4a|mp3|ogg|opus|wav|webm|wma)$/i;

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith(AUDIO_PREFIX)) {
    return true;
  }
  return AUDIO_EXTENSION.test(file.name);
}

export function fileStem(fileName: string): string {
  const trimmed = fileName.trim();
  const dot = trimmed.lastIndexOf('.');
  if (dot <= 0) {
    return trimmed || 'Untitled';
  }
  return trimmed.slice(0, dot);
}

export function playableFromLocalTrack(
  track: LocalLibraryTrack,
): TahtiPlayable {
  return {
    id: `local:${track.id}`,
    kind: 'archive',
    title: track.title,
    artist: track.artist,
    streamUrl: track.objectUrl,
    protocol: 'https',
    sourceProvider: 'local',
  };
}

export const useLocalLibraryStore = create<LocalLibraryState>((set, get) => ({
  tracks: [],
  addFiles: (files) => {
    const added: LocalLibraryTrack[] = [];
    for (const file of files) {
      if (!isAudioFile(file)) {
        continue;
      }
      const id = crypto.randomUUID();
      added.push({
        id,
        title: fileStem(file.name),
        artist: 'Local file',
        fileName: file.name,
        objectUrl: URL.createObjectURL(file),
        addedAt: new Date().toISOString(),
      });
    }
    if (added.length > 0) {
      set({ tracks: [...get().tracks, ...added] });
    }
    return added;
  },
  remove: (id) => {
    const current = get().tracks.find((track) => track.id === id);
    if (current) {
      URL.revokeObjectURL(current.objectUrl);
    }
    set({ tracks: get().tracks.filter((track) => track.id !== id) });
  },
  clear: () => {
    for (const track of get().tracks) {
      URL.revokeObjectURL(track.objectUrl);
    }
    set({ tracks: [] });
  },
}));
