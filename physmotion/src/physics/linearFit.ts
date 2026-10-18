import { isValidFitInput, mean, rSquared } from './fitStats';

/**
 * Ajuste lineal por mínimos cuadrados: x(t) = m·t + n.
 * En un proyectil, la pendiente m es la velocidad horizontal v0x.
 *
 *   m = Σ (t − t̄)(y − ȳ) / Σ (t − t̄)²
 *   n = ȳ − m·t̄
 *
 * @param times  tiempos en segundos (medidos desde el fotograma t = 0)
 * @param values posiciones en metros
 * @returns { m, n, r2 }, o null si los datos no alcanzan: arreglos de distinta longitud,
 *          menos de 2 puntos, menos de 2 tiempos distintos o valores no finitos.
 */
export function fitLinear(
  times: readonly number[],
  values: readonly number[],
): { m: number; n: number; r2: number } | null {
  if (!isValidFitInput(times, values, 2, 2)) return null;

  const tMean = mean(times);
  const vMean = mean(values);

  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < times.length; i++) {
    const dt = times[i] - tMean;
    sxx += dt * dt;
    sxy += dt * (values[i] - vMean);
  }
  if (sxx === 0) return null;

  const m = sxy / sxx;
  const n = vMean - m * tMean;
  if (!Number.isFinite(m) || !Number.isFinite(n)) return null;

  const fitted = times.map((t) => m * t + n);
  return { m, n, r2: rSquared(values, fitted) };
}