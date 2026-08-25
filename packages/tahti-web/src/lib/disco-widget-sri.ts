const HEX_BUNDLE_HASH_RE = /^[0-9a-f]{64}$/;

export function isValidBundleHashHex(value: string): boolean {
  return HEX_BUNDLE_HASH_RE.test(value);
}

function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/** `sha256-<base64>` — the value a `<script integrity>` attribute expects. */
export function bundleHashToIntegrity(bundleHashHex: string): string {
  return `sha256-${hexToBase64(bundleHashHex)}`;
}
