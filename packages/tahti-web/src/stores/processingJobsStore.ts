import { create } from 'zustand';

export type ProcessingJob = {
  id: string;
  title: string;
  status: 'PENDING' | 'PROCESSING';
};

type ProcessingJobsState = {
  jobs: ProcessingJob[];
  start: (jobs: ProcessingJob[]) => void;
  settle: (ids: string[]) => void;
};

export const useProcessingJobsStore = create<ProcessingJobsState>((set) => ({
  jobs: [],
  start: (jobs) =>
    set((state) => {
      const existing = new Map(state.jobs.map((job) => [job.id, job]));
      for (const job of jobs) {
        existing.set(job.id, job);
      }
      return { jobs: [...existing.values()] };
    }),
  settle: (ids) =>
    set((state) => {
      const settled = new Set(ids);
      return { jobs: state.jobs.filter((job) => !settled.has(job.id)) };
    }),
}));
