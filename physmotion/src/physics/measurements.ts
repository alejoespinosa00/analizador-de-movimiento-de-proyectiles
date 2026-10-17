import type { Measurement, PixelPoint, ReferenceSystem } from '../types/analysis';
import { pixelToPhysical } from '../utils/coordinates';

/** frameIndex → tiempo en segundos. */
export function frameToTime(frameIndex: number, fps: number, startFrame = 0): number {
  return (frameIndex - startFrame) / fps;
}

/** Crea una medición a partir de un clic sobre el video. */
export function createMeasurement(
  pixel: PixelPoint,
  frameIndex: number,
  fps: number,
  startFrame: number,
  ref: ReferenceSystem,
): Measurement {
  return {
    id: crypto.randomUUID(),
    frameIndex,
    time: frameToTime(frameIndex, fps, startFrame),
    pixel,
    physical: pixelToPhysical(pixel, ref) ?? undefined,
  };
}

// TODO(sprint-3): desplazamiento entre puntos y velocidad media entre mediciones consecutivas.
