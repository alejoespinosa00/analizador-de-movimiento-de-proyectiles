import type { FitResult, Measurement, PhysicalPoint } from '../types/analysis';

export interface XY {
  x: number;
  y: number;
}

export interface TrajectoryChartData {
  /** Puntos marcados por el usuario, en metros, ordenados por tiempo. */
  measured: XY[];
  /** Parábola ajustada muestreada entre el primer y el último punto medido. */
  curve: XY[];
}

/** Cantidad de puntos con que se dibuja la curva ajustada. */
export const CURVE_SAMPLES = 60;

type Calibrated = Measurement & { physical: PhysicalPoint };

/**
 * Datos de la gráfica y vs x: los puntos medidos (en metros) y la curva ajustada.
 *
 * La curva se obtiene evaluando x(t) = m·t + n e y(t) = a·t² + b·t + c en `samples` instantes
 * entre el primer y el último punto medido. Función pura: no lee el store.
 * Si hay menos de 2 instantes distintos, no hay curva que dibujar.
 */
export function trajectoryChartData(
  measurements: Measurement[],
  fit: FitResult,
  samples: number = CURVE_SAMPLES,
): TrajectoryChartData {
  const points = measurements
    .filter((m): m is Calibrated => m.physical !== undefined)
    .sort((a, b) => a.time - b.time);

  const measured = points.map((m) => ({ x: m.physical.x, y: m.physical.y }));
  if (points.length < 2) return { measured, curve: [] };

  const tMin = points[0].time;
  const tMax = points[points.length - 1].time;
  if (!(tMax - tMin > 1e-9)) return { measured, curve: [] };

  const count = Math.max(2, Math.floor(samples));
  const { m, n } = fit.xOfT;
  const { a, b, c } = fit.yOfT;
  const curve: XY[] = [];
  for (let i = 0; i < count; i++) {
    const t = tMin + ((tMax - tMin) * i) / (count - 1);
    curve.push({ x: m * t + n, y: a * t * t + b * t + c });
  }
  return { measured, curve };
}
