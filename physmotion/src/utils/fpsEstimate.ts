/**
 * Estimación de FPS a partir de los tiempos (mediaTime) de fotogramas consecutivos.
 *
 * Funciones puras: sin React, sin store y sin acceso al DOM.
 *
 * Qué mide: los FPS con que se REPRODUCE el archivo (el reloj del video).
 * Qué NO mide: la cámara lenta. Un video grabado a 240 fps y guardado para reproducirse
 * a 30 dará 30. Los FPS reales de grabación los ingresa el usuario (captureFps).
 */

export type FpsConfidence = 'low' | 'medium' | 'high';

export interface FpsEstimate {
  /** Valor sugerido (redondeado a un FPS habitual si está muy cerca). null si no hay datos. */
  fps: number | null;
  /** Valor medido sin redondear, para mostrar o depurar. */
  rawFps: number | null;
  confidence: FpsConfidence;
  /** true si los intervalos entre fotogramas no son regulares (FPS variable). */
  isVariable: boolean;
  /** Cantidad de intervalos válidos que se usaron. */
  diffCount: number;
}

// --- Parámetros: ajústenlos aquí, no en la lógica ---
const MAX_GAP_SECONDS = 0.5; // intervalos mayores: hubo una pausa o un salto
const TOLERANCE = 0.1; // ±10% alrededor de la mediana cuenta como intervalo regular
const MIN_DIFFS = 3; // por debajo de esto no se estima nada
export const MEDIUM_DIFFS = 10; // desde aquí la confianza puede dejar de ser 'low'
const HIGH_DIFFS = 20; // desde aquí la confianza puede ser 'high'
const MIN_CONSISTENCY = 0.8; // por debajo, el video se considera de FPS variable
const HIGH_CONSISTENCY = 0.9; // mínimo para confianza 'high'
const SNAP_TOLERANCE = 0.01; // redondear a un FPS habitual si está a menos del 1%
const COMMON_FPS = [24, 25, 30, 50, 60, 120, 240];

/** Mediana de una lista ya ordenada de menor a mayor. */
function medianOfSorted(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * @param times mediaTime (segundos) de los fotogramas, en el orden en que llegaron.
 *              No se modifica.
 */
export function estimateFpsFromTimestamps(times: readonly number[]): FpsEstimate {
  // 1. Ignorar valores que no sean números finitos.
  const clean = times.filter((t) => Number.isFinite(t));

  // 2-3. Intervalos entre tiempos consecutivos. Se descartan los que no son válidos:
  //      <= 0 (fotograma repetido o salto hacia atrás) y > MAX_GAP_SECONDS (pausa o salto).
  const diffs: number[] = [];
  for (let i = 1; i < clean.length; i++) {
    const d = clean[i] - clean[i - 1];
    if (d > 0 && d <= MAX_GAP_SECONDS) diffs.push(d);
  }

  // 4. Muy pocos datos: no se estima.
  if (diffs.length < MIN_DIFFS) {
    return {
      fps: null,
      rawFps: null,
      confidence: 'low',
      isVariable: false,
      diffCount: diffs.length,
    };
  }

  // 5. Mediana (y no promedio): un fotograma perdido produce un intervalo doble que
  //    el promedio arrastraría y la mediana ignora.
  const sorted = [...diffs].sort((a, b) => a - b);
  const median = medianOfSorted(sorted);

  // 6. FPS medido.
  const rawFps = 1 / median;

  // 7. Consistencia: fracción de intervalos dentro de ±TOLERANCE de la mediana.
  const regular = diffs.filter((d) => Math.abs(d - median) <= median * TOLERANCE).length;
  const consistency = regular / diffs.length;
  const isVariable = consistency < MIN_CONSISTENCY;

  // 8. Redondeo a un FPS habitual (29.97 → 30). Si no hay uno cerca, 2 decimales.
  const snapped = COMMON_FPS.find((c) => Math.abs(rawFps - c) / c <= SNAP_TOLERANCE);
  const fps = snapped ?? Math.round(rawFps * 100) / 100;

  // 9. Confianza.
  let confidence: FpsConfidence = 'medium';
  if (isVariable || diffs.length < MEDIUM_DIFFS) confidence = 'low';
  else if (diffs.length >= HIGH_DIFFS && consistency >= HIGH_CONSISTENCY) confidence = 'high';

  return { fps, rawFps, confidence, isVariable, diffCount: diffs.length };
}
