/**
 * Minimal Web Audio stand-in for testing `buildPreviewNodes` outside a
 * browser — vitest's default (node) and jsdom environments don't implement
 * `AudioContext`. Only implements what the four fx plugins actually call;
 * each fake node just exposes plain-object AudioParams so a test can read
 * back whatever value a plugin assigned.
 */
export function createFakeAudioContext() {
  const createBiquadFilter = () => ({
    type: 'lowpass' as BiquadFilterType,
    frequency: { value: 0 },
    Q: { value: 0 },
    gain: { value: 0 },
  });
  const createDynamicsCompressor = () => ({
    threshold: { value: 0 },
    knee: { value: 0 },
    ratio: { value: 0 },
    attack: { value: 0 },
    release: { value: 0 },
  });
  const createGain = () => ({ gain: { value: 0 } });

  return {
    createBiquadFilter,
    createDynamicsCompressor,
    createGain,
  } as unknown as AudioContext;
}
