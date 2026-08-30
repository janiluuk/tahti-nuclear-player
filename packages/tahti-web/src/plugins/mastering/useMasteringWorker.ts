import { useCallback, useEffect, useRef, useState } from 'react';

import type { MasteringStage } from './match';
import type {
  WorkerRequest,
  WorkerResponse,
  WorkerTrackPayload,
} from './protocol';

export type MasteringWorkerStatus = 'idle' | MasteringStage | 'done' | 'error';

export type MasteringWorkerResult = {
  blob: Blob;
  url: string;
  sampleRate: number;
};

export function useMasteringWorker() {
  const workerRef = useRef<Worker | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<MasteringWorkerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MasteringWorkerResult | null>(null);

  const cleanupWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  useEffect(
    () => () => {
      cleanupWorker();
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    },
    [cleanupWorker],
  );

  const run = useCallback(
    (target: WorkerTrackPayload, reference: WorkerTrackPayload) => {
      cleanupWorker();
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
        resultUrlRef.current = null;
      }
      setError(null);
      setResult(null);
      setStatus('matching-levels');

      const worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      });
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === 'progress') {
          setStatus(message.stage);
          return;
        }
        if (message.type === 'done') {
          const blob = new Blob([message.wav], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          resultUrlRef.current = url;
          setResult({ blob, url, sampleRate: message.sampleRate });
          setStatus('done');
          cleanupWorker();
          return;
        }
        setError(message.message);
        setStatus('error');
        cleanupWorker();
      };

      worker.onerror = (event) => {
        setError(event.message || 'Mastering failed unexpectedly.');
        setStatus('error');
        cleanupWorker();
      };

      const request: WorkerRequest = { type: 'match', target, reference };
      worker.postMessage(request, [
        target.left.buffer,
        target.right.buffer,
        reference.left.buffer,
        reference.right.buffer,
      ]);
    },
    [cleanupWorker],
  );

  const reset = useCallback(() => {
    cleanupWorker();
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setStatus('idle');
    setError(null);
    setResult(null);
  }, [cleanupWorker]);

  return { status, error, result, run, reset };
}
