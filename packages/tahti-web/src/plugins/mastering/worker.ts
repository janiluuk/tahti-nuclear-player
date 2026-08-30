/// <reference lib="webworker" />
import { encodeWavPcm16 } from './dsp/wav';
import { defaultMasteringConfig, matchTracks } from './match';
import type { WorkerRequest, WorkerResponse } from './protocol';

function post(message: WorkerResponse, transfer?: Transferable[]): void {
  if (transfer) {
    (self as unknown as Worker).postMessage(message, transfer);
  } else {
    (self as unknown as Worker).postMessage(message);
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { target, reference } = event.data;
  try {
    const result = matchTracks(
      {
        stereo: {
          left: Float64Array.from(target.left),
          right: Float64Array.from(target.right),
        },
        sampleRate: target.sampleRate,
      },
      {
        stereo: {
          left: Float64Array.from(reference.left),
          right: Float64Array.from(reference.right),
        },
        sampleRate: reference.sampleRate,
      },
      defaultMasteringConfig(target.sampleRate),
      (stage) => post({ type: 'progress', stage }),
    );

    const wav = encodeWavPcm16(result, target.sampleRate);
    post({ type: 'done', wav, sampleRate: target.sampleRate }, [wav]);
  } catch (err) {
    post({
      type: 'error',
      message: err instanceof Error ? err.message : 'Mastering failed.',
    });
  }
};
