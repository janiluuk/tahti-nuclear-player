export type MockUploadedSound = {
  id: string;
  title: string;
  filename: string;
  objectUrl: string;
  channelSlug: string;
  downloadsEnabled: boolean;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'STASH';
  accessMode?: 'FREE' | 'SUBSCRIBERS_ONLY' | 'PURCHASE';
  purchaseTierId?: string | null;
  /** Base64 of original bytes so blob URLs can be recreated after reload. */
  fileDataBase64?: string;
  mimeType?: string;
};

const uploads = new Map<string, MockUploadedSound>();

const STORAGE_KEY = 'tahti-mock-uploaded-sounds';
const IDB_NAME = 'tahti-mock-uploaded-sounds-db';
const IDB_STORE = 'files';
const IDB_VERSION = 1;

type PersistedMeta = Omit<MockUploadedSound, 'fileDataBase64' | 'objectUrl'> & {
  objectUrl?: string;
  hasFileBytes?: boolean;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function openFileDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onerror = () => resolve(null);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
    } catch {
      resolve(null);
    }
  });
}

async function idbPutFile(
  id: string,
  payload: { base64: string; mimeType: string },
): Promise<void> {
  const db = await openFileDb();
  if (!db) {
    return;
  }
  await new Promise<void>((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(payload, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
  db.close();
}

async function idbGetFile(
  id: string,
): Promise<{ base64: string; mimeType: string } | null> {
  const db = await openFileDb();
  if (!db) {
    return null;
  }
  const result = await new Promise<{ base64: string; mimeType: string } | null>(
    (resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const request = tx.objectStore(IDB_STORE).get(id);
      request.onsuccess = () => {
        const value = request.result as
          | { base64: string; mimeType: string }
          | undefined;
        resolve(value ?? null);
      };
      request.onerror = () => resolve(null);
    },
  );
  db.close();
  return result;
}

function hydrateFromBase64(
  row: MockUploadedSound,
  base64: string,
  mimeType?: string,
): MockUploadedSound {
  const bytes = base64ToUint8Array(base64);
  const blob = new Blob([bytes], {
    type: mimeType || row.mimeType || 'application/octet-stream',
  });
  return {
    ...row,
    fileDataBase64: base64,
    mimeType: mimeType || row.mimeType,
    objectUrl: URL.createObjectURL(blob),
  };
}

export async function registerMockUploadedSound(
  sound: MockUploadedSound,
): Promise<MockUploadedSound> {
  let fileDataBase64 = sound.fileDataBase64;
  let mimeType = sound.mimeType || 'application/octet-stream';
  if (!fileDataBase64 && sound.objectUrl) {
    try {
      const response = await fetch(sound.objectUrl);
      const buffer = await response.arrayBuffer();
      fileDataBase64 = arrayBufferToBase64(buffer);
      mimeType =
        sound.mimeType ||
        response.headers.get('content-type') ||
        'application/octet-stream';
    } catch {
      // Keep the live objectUrl for this session even if bytes cannot be snapshotted.
    }
  }
  const row: MockUploadedSound = {
    ...sound,
    fileDataBase64,
    mimeType,
  };
  uploads.set(row.id, row);
  persistIndex();
  if (fileDataBase64) {
    await idbPutFile(row.id, { base64: fileDataBase64, mimeType });
  }
  return row;
}

export function getMockUploadedSound(id: string): MockUploadedSound | null {
  const memory = uploads.get(id);
  if (memory) {
    return memory;
  }
  const persisted = readPersisted().find((row) => row.id === id);
  if (!persisted) {
    return null;
  }
  if (persisted.fileDataBase64) {
    const hydrated = hydrateFromBase64(persisted, persisted.fileDataBase64);
    uploads.set(hydrated.id, hydrated);
    return hydrated;
  }
  return persisted;
}

export async function ensureMockUploadedSound(
  id: string,
): Promise<MockUploadedSound | null> {
  const memory = uploads.get(id);
  if (memory?.objectUrl) {
    return memory;
  }
  const meta = readPersisted().find((row) => row.id === id) ?? null;
  if (!meta) {
    return null;
  }
  if (meta.fileDataBase64) {
    const hydrated = hydrateFromBase64(meta, meta.fileDataBase64);
    uploads.set(hydrated.id, hydrated);
    return hydrated;
  }
  const file = await idbGetFile(id);
  if (!file) {
    return meta;
  }
  const hydrated = hydrateFromBase64(meta, file.base64, file.mimeType);
  uploads.set(hydrated.id, hydrated);
  return hydrated;
}

export function listMockUploadedSounds(): MockUploadedSound[] {
  const fromMemory = Array.from(uploads.values());
  if (fromMemory.length > 0) {
    return fromMemory;
  }
  return readPersisted().map((row) => {
    if (row.fileDataBase64) {
      const hydrated = hydrateFromBase64(row, row.fileDataBase64);
      uploads.set(hydrated.id, hydrated);
      return hydrated;
    }
    void ensureMockUploadedSound(row.id);
    return row;
  });
}

export function patchMockUploadedSound(
  id: string,
  patch: Partial<MockUploadedSound>,
): void {
  const current = getMockUploadedSound(id);
  if (!current) {
    return;
  }
  uploads.set(id, { ...current, ...patch });
  persistIndex();
}

function persistIndex(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  const rows: PersistedMeta[] = Array.from(uploads.values()).map((row) => ({
    id: row.id,
    title: row.title,
    filename: row.filename,
    channelSlug: row.channelSlug,
    downloadsEnabled: row.downloadsEnabled,
    visibility: row.visibility,
    accessMode: row.accessMode ?? 'FREE',
    purchaseTierId: row.purchaseTierId ?? null,
    mimeType: row.mimeType,
    hasFileBytes: Boolean(row.fileDataBase64),
  }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // Quota (large WAVs live in IndexedDB); keep in-memory map.
  }
}

function readPersisted(): MockUploadedSound[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Array<
      MockUploadedSound & { hasFileBytes?: boolean }
    >;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((row) => ({
      id: row.id,
      title: row.title,
      filename: row.filename,
      objectUrl: row.objectUrl || '',
      channelSlug: row.channelSlug,
      downloadsEnabled: row.downloadsEnabled,
      visibility: row.visibility,
      accessMode: row.accessMode,
      purchaseTierId: row.purchaseTierId,
      mimeType: row.mimeType,
      fileDataBase64: row.fileDataBase64,
    }));
  } catch {
    return [];
  }
}
