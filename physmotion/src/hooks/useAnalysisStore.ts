import { create } from 'zustand';
import type {
  Measurement,
  PickMode,
  PixelPoint,
  ReferenceSystem,
  VideoInfo,
} from '../types/analysis';
import { createMeasurement, frameToTime } from '../physics/measurements';
import { pixelToPhysical } from '../utils/coordinates';

interface AnalysisState {
  video: VideoInfo | null;
  reference: ReferenceSystem;
  /** Fotograma que se toma como t = 0. Lo fija el primer punto marcado. */
  startFrame: number;
  currentFrame: number;
  measurements: Measurement[];
  /** Qué hace el siguiente clic sobre el video. */
  pickMode: PickMode;

  setVideo: (video: VideoInfo | null) => void;
  updateVideo: (patch: Partial<VideoInfo>) => void;
  setReference: (patch: Partial<ReferenceSystem>) => void;
  setStartFrame: (frame: number) => void;
  setCurrentFrame: (frame: number) => void;
  setPickMode: (mode: PickMode) => void;
  addMeasurement: (m: Measurement) => void;
  /** Marca un punto en el fotograma actual (ver reglas en la implementación). */
  addMeasurementAt: (pixel: PixelPoint) => void;
  removeMeasurement: (id: string) => void;
  clearMeasurements: () => void;
  reset: () => void;
}

const initialReference: ReferenceSystem = {
  origin: null,
  axisAngle: 0,
  scale: null,
};

/** FPS para convertir fotogramas a tiempo real: los de grabación si es cámara lenta. */
function effectiveFps(video: VideoInfo | null): number | null {
  if (!video) return null;
  return video.captureFps ?? video.fps;
}

/** Recalcula lo que depende de la referencia, de t = 0 y de los FPS. */
function recompute(
  measurements: Measurement[],
  reference: ReferenceSystem,
  startFrame: number,
  fps: number | null,
): Measurement[] {
  return measurements.map((m) => ({
    ...m,
    time: fps ? frameToTime(m.frameIndex, fps, startFrame) : m.time,
    physical: pixelToPhysical(m.pixel, reference) ?? undefined,
  }));
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  video: null,
  reference: initialReference,
  startFrame: 0,
  currentFrame: 0,
  measurements: [],
  pickMode: null,

  // Un video nuevo empieza de cero: la referencia y los puntos son de cada video.
  setVideo: (video) =>
    set({
      video,
      reference: initialReference,
      pickMode: null,
      measurements: [],
      currentFrame: 0,
      startFrame: 0,
    }),

  updateVideo: (patch) =>
    set((s) => {
      if (!s.video) return s;
      const video = { ...s.video, ...patch };
      return {
        video,
        measurements: recompute(s.measurements, s.reference, s.startFrame, effectiveFps(video)),
      };
    }),

  // Al cambiar origen o escala, los puntos ya marcados se recalculan en metros.
  setReference: (patch) =>
    set((s) => {
      const reference = { ...s.reference, ...patch };
      return {
        reference,
        measurements: recompute(s.measurements, reference, s.startFrame, effectiveFps(s.video)),
      };
    }),

  setStartFrame: (startFrame) =>
    set((s) => ({
      startFrame,
      measurements: recompute(s.measurements, s.reference, startFrame, effectiveFps(s.video)),
    })),

  setCurrentFrame: (currentFrame) => set({ currentFrame }),
  setPickMode: (pickMode) => set({ pickMode }),
  addMeasurement: (m) => set((s) => ({ measurements: [...s.measurements, m] })),

  // Reglas:
  //  - El primer punto marcado fija t = 0 (startFrame = su fotograma).
  //  - Un fotograma tiene un solo punto: marcar otra vez en el mismo fotograma lo reemplaza.
  //  - Los puntos quedan ordenados por fotograma.
  addMeasurementAt: (pixel) =>
    set((s) => {
      const fps = effectiveFps(s.video);
      if (!s.video || !fps) return s;

      const frame = s.currentFrame;
      const startFrame = s.measurements.length === 0 ? frame : s.startFrame;
      const created = createMeasurement(pixel, frame, fps, startFrame, s.reference);
      const existing = s.measurements.find((m) => m.frameIndex === frame);

      const measurements = existing
        ? s.measurements.map((m) => (m.id === existing.id ? { ...created, id: existing.id } : m))
        : [...s.measurements, created].sort((a, b) => a.frameIndex - b.frameIndex);

      return { measurements, startFrame };
    }),

  // Sin puntos, t = 0 vuelve a quedar libre para el próximo primer punto.
  removeMeasurement: (id) =>
    set((s) => {
      const measurements = s.measurements.filter((m) => m.id !== id);
      return { measurements, startFrame: measurements.length === 0 ? 0 : s.startFrame };
    }),

  clearMeasurements: () => set({ measurements: [], startFrame: 0 }),

  reset: () =>
    set({
      video: null,
      reference: initialReference,
      startFrame: 0,
      currentFrame: 0,
      measurements: [],
      pickMode: null,
    }),
}));
