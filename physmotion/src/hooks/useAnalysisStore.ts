import { create } from 'zustand';
import type { Measurement, ReferenceSystem, VideoInfo } from '../types/analysis';

interface AnalysisState {
  video: VideoInfo | null;
  reference: ReferenceSystem;
  /** Fotograma que el usuario define como t = 0. */
  startFrame: number;
  currentFrame: number;
  measurements: Measurement[];

  setVideo: (video: VideoInfo | null) => void;
  updateVideo: (patch: Partial<VideoInfo>) => void;
  setReference: (patch: Partial<ReferenceSystem>) => void;
  setStartFrame: (frame: number) => void;
  setCurrentFrame: (frame: number) => void;
  addMeasurement: (m: Measurement) => void;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
  reset: () => void;
}

const initialReference: ReferenceSystem = {
  origin: { x: 0, y: 0 },
  axisAngle: 0,
  scale: null,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  video: null,
  reference: initialReference,
  startFrame: 0,
  currentFrame: 0,
  measurements: [],

  setVideo: (video) => set({ video, measurements: [], currentFrame: 0, startFrame: 0 }),
  updateVideo: (patch) => set((s) => (s.video ? { video: { ...s.video, ...patch } } : s)),
  setReference: (patch) => set((s) => ({ reference: { ...s.reference, ...patch } })),
  setStartFrame: (startFrame) => set({ startFrame }),
  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  addMeasurement: (m) => set((s) => ({ measurements: [...s.measurements, m] })),
  removeMeasurement: (id) =>
    set((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) })),
  clearMeasurements: () => set({ measurements: [] }),
  reset: () =>
    set({
      video: null,
      reference: initialReference,
      startFrame: 0,
      currentFrame: 0,
      measurements: [],
    }),
}));
