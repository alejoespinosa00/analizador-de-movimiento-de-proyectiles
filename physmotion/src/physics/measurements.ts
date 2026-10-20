import type { Measurement, PhysicalPoint, PixelPoint, ReferenceSystem } from '../types/analysis';
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

/** Diferencia mínima de tiempo (s) para calcular una velocidad media. */
const MIN_DT = 1e-9;

/** Desplazamiento entre dos posiciones, en metros. */
export interface Displacement {
  dx: number;
  dy: number;
  /** Distancia en línea recta entre las dos posiciones. */
  magnitude: number;
}

/** Movimiento entre dos puntos consecutivos: desplazamiento y velocidad media. */
export interface SegmentMotion extends Displacement {
  fromFrame: number;
  toFrame: number;
  fromTime: number;
  toTime: number;
  /** Tiempo transcurrido entre los dos puntos (s). */
  dt: number;
  /** Componentes de la velocidad media: Δposición / Δt (m/s). */
  vx: number;
  vy: number;
  /** Módulo de la velocidad media (m/s). */
  speed: number;
}

type Calibrated = Measurement & { physical: PhysicalPoint };

/** Mediciones con coordenadas físicas, ordenadas por tiempo. */
function calibratedByTime(measurements: Measurement[]): Calibrated[] {
  return measurements
    .filter((m): m is Calibrated => m.physical !== undefined)
    .sort((a, b) => a.time - b.time);
}

/** Desplazamiento de `from` a `to`: Δx, Δy y distancia en línea recta. */
export function displacement(from: PhysicalPoint, to: PhysicalPoint): Displacement {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return { dx, dy, magnitude: Math.hypot(dx, dy) };
}

/**
 * Desplazamiento y velocidad media entre cada par de puntos consecutivos (por tiempo).
 * Solo cuenta los puntos con escala; los pares con el mismo tiempo se omiten.
 */
export function segmentMotions(measurements: Measurement[]): SegmentMotion[] {
  const points = calibratedByTime(measurements);
  const segments: SegmentMotion[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dt = b.time - a.time;
    if (!(dt > MIN_DT)) continue;
    const d = displacement(a.physical, b.physical);
    const vx = d.dx / dt;
    const vy = d.dy / dt;
    segments.push({
      ...d,
      fromFrame: a.frameIndex,
      toFrame: b.frameIndex,
      fromTime: a.time,
      toTime: b.time,
      dt,
      vx,
      vy,
      speed: Math.hypot(vx, vy),
    });
  }
  return segments;
}

/** Desplazamiento del primer al último punto (por tiempo), o null con menos de 2 puntos. */
export function totalDisplacement(measurements: Measurement[]): Displacement | null {
  const points = calibratedByTime(measurements);
  if (points.length < 2) return null;
  return displacement(points[0].physical, points[points.length - 1].physical);
}
