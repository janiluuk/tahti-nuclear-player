# Mastering (reference matching)

A client-side port of [Matchering](https://github.com/sergree/matchering) —
give it a track and a reference track, and it matches the track's loudness
and tonal balance toward the reference's, using a lookahead limiter for the
final output. Reached from the track editor and the Pro Editor as
"Match to a reference track" / "Mastering" — named that way in the UI to
avoid confusion with the Pro Editor's own EQ/Comp/Limiter/Filter chain
panel, which is also (confusingly) titled "Mastering" there.

## Why this runs entirely in the browser

`tahti-web` has no backend of its own, and the real work here — FFT-based
EQ matching, RMS-based level matching, a lookahead limiter — is pure
numeric signal processing with nothing Python-specific about it. It's
expressible as plain math over `Float32Array`s, which the browser already
does natively (`AudioContext.decodeAudioData` for loading, a Web Worker for
the number-crunching so the UI thread stays responsive). No server contract
was invented for this; it genuinely doesn't need one.

## Contract

```ts
matchTracks(target: MasteringInput, reference: MasteringInput, config?, onProgress?) => StereoSignal
```

`match.ts` is the orchestration entry point (pure, no browser APIs — fully
unit-testable). `worker.ts` wraps it as a Web Worker
(`new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })`);
`useMasteringWorker.ts` is the host hook a view calls into
(`run(target, reference)`, `status`, `error`, `result.url`/`.blob`).
`decodeAudio.ts` decodes the source track's URL and an uploaded reference
`File` through one shared `AudioContext` — the thing that actually
guarantees they land at the same sample rate, which `matchTracks` requires.

## What's faithfully ported vs. simplified

Read against `/home/jani/workspace/matchering/matchering/` (`stages.py`,
`dsp.py`, `stage_helpers/*.py`, `limiter/hyrax.py`, `defaults.py`), using
matchering's own **default** `Config`/`LimiterConfig` values:

**Faithfully ported**, in `dsp/`:

- `fft.ts` — a radix-2 FFT/IFFT plus real-input `rfft`/`irfft`, since no
  FFT/DSP library exists anywhere in this monorepo yet and none was added
  as a dependency — this is small, self-contained, testable math, kept
  auditable the same way `audio-fx/testAudioContext.ts` hand-rolls just
  what it needs rather than pulling in a testing framework.
- `levels.ts` — mid/side decomposition, piece-based RMS analysis, "loudest
  pieces" extraction, RMS-coefficient level matching
  (`stage_helpers/match_levels.py`).
- `frequencies.ts` — average magnitude spectrum of the loudest pieces,
  log-frequency LOWESS-smoothed EQ-matching FIR derivation, overlap-add
  convolution (`stage_helpers/match_frequencies.py`). Matchering's default
  `lowess_it=0` means this is one tricube-weighted local regression pass,
  not iterative reweighting — genuinely simpler than "LOWESS" usually
  implies, not a simplification of matchering's own default behavior.
- `limiter.ts` — the Hyrax lookahead limiter: rectify → attack (sliding
  -window max + a one-pole smoothing filter) → hold/release (sliding
  -window max + two order-1 Butterworth lowpass filters). Both Butterworth
  filters are order 1 by default, so `butterworth.ts` only needs the
  closed-form single-pole bilinear-transform design, not general filter
  design, plus a `filtfilt` (zero-phase) and a plain `lfilter` (matching
  which of hyrax's two filter stages uses which).
- `cubicSpline.ts` — a natural cubic spline for the linear ↔ log-frequency
  resampling `frequencies.ts` needs. Matchering uses
  `scipy.interpolate.interp1d(kind='cubic')`, a not-a-knot B-spline — a
  different (but comparably smooth, C2-continuous) boundary condition, not
  a materially different curve.

**Deliberately simplified/adapted** (not hidden):

- Loading uses `AudioContext.decodeAudioData` instead of matchering's own
  ffmpeg-based loader — whatever formats the browser can decode (wav, mp3,
  ogg, m4a depending on the browser), the same set a listener can already
  play in Tahti.
- Only the default-config numeric behavior is exposed; matchering's dozens
  of `Config`/`LimiterConfig` knobs aren't UI-configurable in this pass.
- Matchering's `checker.py` heuristics (clipping-sample counts, DC-offset
  warnings, etc.) aren't ported — only the hard requirements it actually
  enforces before processing (stereo, both inputs longer than one
  `fftSize`) are checked, with a clear error message.
- Only the "with limiter" output is produced. Matchering can also emit "no
  limiter" / "no limiter, normalized" variants — a natural, separately
  -scoped follow-up, not implemented here.
- `slidingMax.ts`'s edge handling clamps to the edge value instead of
  scipy's `mode='reflect'` mirroring. The affected region is at most one
  window's width (tens of samples) at the very start/end of a track that's
  typically millions of samples long.
- Output is downloadable/playable as WAV in the browser; it is **not**
  written back into the user's Tahti archive as a new track/version. That
  would need a new "create an archive item from raw client-side audio"
  server contract, which doesn't exist — out of scope here, same reasoning
  as this repo's other "blocked until server-side X lands" notes.

## Testing

Every `dsp/*.ts` module has a colocated `*.test.ts` verifying it against
synthetic signals with known, checkable properties (FFT round-trips and a
brute-force DFT cross-check, a Butterworth filter's DC gain and zero-phase
property, a sliding-max filter against a naive O(n·w) reference, RMS
-matching landing at the expected coefficient, an EQ-matching FIR measurably
brightening a dull target toward a bright reference, the limiter bringing a
clipping peak down to threshold without ever *raising* a sample's
amplitude) — not bit-exact parity with the Python library, which isn't
practically verifiable without a Python runtime in this repo.
`match.test.ts` is the end-to-end integration test: mastering a quiet
target against a louder reference measurably closes the loudness gap
without exceeding the limiter's threshold. `e2e/mastering.spec.ts` (repo
root `e2e/`) exercises the real UI, worker, and route against small fixture
WAV files.
