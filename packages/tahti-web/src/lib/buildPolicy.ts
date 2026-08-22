type BuildEnvironment = Record<string, string | undefined>;

export function validateProductionBuildEnvironment(
  command: 'build' | 'serve',
  env: BuildEnvironment,
): void {
  if (command !== 'build') {
    return;
  }
  const unsafeKey = ['VITE_FORCE_MOCK', 'VITE_ALLOW_MOCK_FALLBACK'].find(
    (key) => env[key] === '1',
  );
  if (unsafeKey) {
    throw new Error(`${unsafeKey}=1 is not allowed in a production build`);
  }
}

export const diagnosticsEnabled =
  Boolean(import.meta.env?.DEV) ||
  import.meta.env?.VITE_ENABLE_DIAGNOSTICS === '1';
