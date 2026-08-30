import type { MasteringStage } from './match';

export type WorkerTrackPayload = {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
};

export type WorkerRequest = {
  type: 'match';
  target: WorkerTrackPayload;
  reference: WorkerTrackPayload;
};

export type WorkerResponse =
  | { type: 'progress'; stage: MasteringStage }
  | { type: 'done'; wav: ArrayBuffer; sampleRate: number }
  | { type: 'error'; message: string };
