import type { Measurement, ProjectileResults, ValidationIssue, VideoInfo } from '../types/analysis';
import { formatNumber } from '../utils/format';
import { RELIABLE_POINTS } from './validation';

/** R² mínimo de y(t) (parábola) para considerar bueno el ajuste. */
export const MIN_R2_Y = 0.95;
/** R² mínimo de x(t) (recta) para considerar bueno el ajuste. */
export const MIN_R2_X = 0.9;

/**
 * Advertencias sobre qué tan fiables son los resultados YA calculados.
 *
 * Es distinto de `validateData`: aquella decide si se puede calcular; esta evalúa la calidad
 * de lo calculado. Función pura: no lee el store.
 *
 * Reglas: R² bajo en x(t) o y(t), pocos puntos y FPS sin confirmar.
 * (La escala no se evalúa: siempre la ingresa el usuario, por eso se marca como «Ingresado».)
 */
export function assessReliability(
  results: ProjectileResults,
  video: VideoInfo | null,
  measurements: Measurement[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const { yOfT, xOfT } = results.fit;
  // `!(r2 >= mínimo)` también captura NaN.
  if (!(yOfT.r2 >= MIN_R2_Y)) {
    issues.push({
      code: 'LOW_R2_Y',
      severity: 'warning',
      message: `La parábola ajusta poco a tus puntos (R² de y(t) = ${formatNumber(yOfT.r2, 3)}, se espera al menos ${MIN_R2_Y}). La gravedad y las velocidades pueden estar lejos del valor real: revisa los puntos marcados.`,
    });
  }
  if (!(xOfT.r2 >= MIN_R2_X)) {
    issues.push({
      code: 'LOW_R2_X',
      severity: 'warning',
      message: `La recta ajusta poco a tus puntos (R² de x(t) = ${formatNumber(xOfT.r2, 3)}, se espera al menos ${MIN_R2_X}). La velocidad horizontal y el alcance pueden ser imprecisos.`,
    });
  }

  const points = new Set(measurements.filter((m) => m.physical !== undefined).map((m) => m.time))
    .size;
  if (points < RELIABLE_POINTS) {
    issues.push({
      code: 'RESULT_FEW_POINTS',
      severity: 'warning',
      message: `Estos resultados salen de solo ${points} puntos. Con menos de ${RELIABLE_POINTS}, un pequeño error de clic cambia mucho los valores.`,
    });
  }

  if (video && video.fpsSource !== 'user') {
    issues.push({
      code: 'RESULT_FPS_NOT_CONFIRMED',
      severity: 'warning',
      message: `Los FPS (${formatNumber(video.fps)}) no están confirmados. Todos los tiempos, velocidades y la gravedad dependen de ellos.`,
    });
  }

  return issues;
}