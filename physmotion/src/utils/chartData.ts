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


export type SeriesKey = 'x' | 'y' | 'vx' | 'vy';

/** Orden en que se ofrecen las gráficas. */
export const SERIES_KEYS: SeriesKey[] = ['x', 'y', 'vx', 'vy'];

export interface SeriesMeta {
  label: string;
  axisLabel: string;
  unit: string;
  /** Qué representan los puntos dibujados. */
  measuredNote: string;
  /** Qué representa la línea ajustada. */
  fittedNote: string;
  /** Las posiciones se miden; las velocidades se calculan a partir de ellas. */
  measuredSource: 'measured' | 'estimated';
}

export const SERIES_META: Record<SeriesKey, SeriesMeta> = {
  x: {
    label: 'x(t)',
    axisLabel: 'x (m)',
    unit: 'm',
    measuredNote: 'puntos que marcaste',
    fittedNote: 'recta ajustada',
    measuredSource: 'measured',
  },
  y: {
    label: 'y(t)',
    axisLabel: 'y (m)',
    unit: 'm',
    measuredNote: 'puntos que marcaste',
    fittedNote: 'parábola ajustada',
    measuredSource: 'measured',
  },
  vx: {
    label: 'vx(t)',
    axisLabel: 'vx (m/s)',
    unit: 'm/s',
    measuredNote: 'velocidad media entre puntos consecutivos',
    fittedNote: 'velocidad del ajuste (constante)',
    measuredSource: 'estimated',
  },
  vy: {
    label: 'vy(t)',
    axisLabel: 'vy (m/s)',
    unit: 'm/s',
    measuredNote: 'velocidad media entre puntos consecutivos',
    fittedNote: 'velocidad del ajuste (su pendiente es −g)',
    measuredSource: 'estimated',
  },
};

export interface TimeSeriesData {
  /** Puntos de la serie. En `x` va el tiempo (s) y en `y` el valor de la variable. */
  measured: XY[];
  /** Curva o recta ajustada, muestreada entre el primer y el último punto medido. */
  fitted: XY[];
}

/**
 * Datos de una gráfica en función del tiempo: x(t), y(t), vx(t) o vy(t).
 *
 * - Posiciones: los puntos medidos (en metros) contra su tiempo.
 * - Velocidades: la velocidad media entre puntos consecutivos, ubicada en el instante medio
 *   de cada intervalo (los pares con el mismo tiempo se omiten).
 * - Ajuste: x = m·t + n, y = a·t² + b·t + c, vx = m, vy = b + 2·a·t.
 *
 * Función pura: no lee el store. Si hay menos de 2 instantes distintos, `fitted` queda vacío.
 */
export function timeSeriesData(
  key: SeriesKey,
  measurements: Measurement[],
  fit: FitResult,
  samples: number = CURVE_SAMPLES,
): TimeSeriesData {
  const points = measurements
    .filter((m): m is Calibrated => m.physical !== undefined)
    .sort((a, b) => a.time - b.time);

  const measured: XY[] = [];
  if (key === 'x' || key === 'y') {
    for (const p of points) measured.push({ x: p.time, y: p.physical[key] });
  } else {
    const axis = key === 'vx' ? 'x' : 'y';
    for (let i = 1; i < points.length; i++) {
      const dt = points[i].time - points[i - 1].time;
      if (!(dt > 1e-9)) continue;
      measured.push({
        x: (points[i].time + points[i - 1].time) / 2,
        y: (points[i].physical[axis] - points[i - 1].physical[axis]) / dt,
      });
    }
  }

  if (points.length < 2) return { measured, fitted: [] };
  const tMin = points[0].time;
  const tMax = points[points.length - 1].time;
  if (!(tMax - tMin > 1e-9)) return { measured, fitted: [] };

  const { m, n } = fit.xOfT;
  const { a, b, c } = fit.yOfT;
  const value = (t: number): number => {
    if (key === 'x') return m * t + n;
    if (key === 'y') return a * t * t + b * t + c;
    if (key === 'vx') return m;
    return b + 2 * a * t;
  };

  const count = Math.max(2, Math.floor(samples));
  const fitted: XY[] = [];
  for (let i = 0; i < count; i++) {
    const t = tMin + ((tMax - tMin) * i) / (count - 1);
    fitted.push({ x: t, y: value(t) });
  }
  return { measured, fitted };
}
