import type {
  Measurement,
  ReferenceSystem,
  ResultKey,
  ValidationIssue,
  ValidationResult,
  VideoInfo,
} from '../types/analysis';
import { metersPerPixel } from '../utils/coordinates';
import { formatNumber } from '../utils/format';

/** Puntos mínimos para ajustar la parábola (tiene 3 coeficientes). */
export const MIN_POINTS = 3;

/**
 * Por debajo de esto el resultado es poco fiable. En simulaciones con ±2 px de error de clic,
 * 15 puntos dan g entre 9.75 y 9.85, pero 5 puntos la dejan entre 9.1 y 10.7.
 */
export const RELIABLE_POINTS = 6;

/** Dos tiempos con una diferencia menor a esto (en segundos) se consideran el mismo. */
const SAME_TIME_EPSILON = 1e-9;

function countDistinct(values: readonly number[]): number {
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  let distinct = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > SAME_TIME_EPSILON) distinct++;
  }
  return distinct;
}

const ORDER: Record<ValidationIssue['severity'], number> = { error: 0, warning: 1, info: 2 };

/**
 * Revisa qué datos hay y qué cálculos son posibles.
 *
 * Errores (bloquean los cálculos): sin video, sin origen, sin escala, menos de 3 puntos.
 * Advertencias (se puede calcular, pero con cuidado): menos de 6 puntos, FPS sin confirmar.
 *
 * Es una función pura: no lee el store. La regla de fondo es no presentar como exacto un
 * resultado que depende de datos insuficientes o estimados (ver README, sección 6).
 */
export function validateData(
  video: VideoInfo | null,
  ref: ReferenceSystem,
  measurements: Measurement[],
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const hasVideo = video !== null;
  const hasOrigin = ref.origin !== null;
  const hasScale = metersPerPixel(ref) !== null;
  const points = countDistinct(measurements.map((m) => m.time));

  if (!hasVideo) {
    issues.push({ code: 'NO_VIDEO', severity: 'error', message: 'Carga un video para empezar.' });
  }
  if (!hasOrigin) {
    issues.push({
      code: 'NO_ORIGIN',
      severity: 'error',
      message: 'Falta el origen: pulsa «Elegir origen» y haz clic sobre el video.',
    });
  }
  if (!hasScale) {
    issues.push({
      code: 'NO_SCALE',
      severity: 'error',
      message:
        'Falta la escala: pulsa «Marcar distancia conocida», marca sus dos extremos e ingresa su longitud en metros.',
    });
  }

  if (points < MIN_POINTS) {
    issues.push({
      code: 'TOO_FEW_POINTS',
      severity: 'error',
      message:
        points === 0
          ? 'Aún no hay puntos: pulsa «Marcar puntos» y haz clic sobre el balón.'
          : `Hay ${points} punto(s): se necesitan al menos ${MIN_POINTS} para ajustar la trayectoria.`,
    });
  } else if (points < RELIABLE_POINTS) {
    issues.push({
      code: 'FEW_POINTS',
      severity: 'warning',
      message: `Con solo ${points} puntos el resultado es poco fiable. Marca al menos ${RELIABLE_POINTS}.`,
    });
  }

  if (video && video.fpsSource !== 'user') {
    issues.push({
      code: 'FPS_NOT_CONFIRMED',
      severity: 'warning',
      message: `Los FPS del video (${formatNumber(video.fps)}) son una estimación. Confírmalos: de ellos depende el tiempo de cada punto.`,
    });
  }

  const calibrated = hasVideo && hasOrigin && hasScale;
  const canFit = calibrated && points >= MIN_POINTS;
  const canCompute: Record<ResultKey, boolean> = {
    position: calibrated && measurements.length >= 1,
    velocity: canFit,
    acceleration: canFit,
    trajectory: canFit,
    flightTime: canFit,
    maxHeight: canFit,
    range: canFit,
  };

  issues.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  return { canCompute, issues };
}