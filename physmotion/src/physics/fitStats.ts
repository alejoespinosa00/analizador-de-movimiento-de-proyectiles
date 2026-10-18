/**
 * Utilidades compartidas por los ajustes por mínimos cuadrados (linearFit y quadraticFit).
 * Funciones puras: sin React, sin store y sin acceso al DOM.
 */

/** Dos tiempos con una diferencia menor a esto (en segundos) se consideran iguales. */
const SAME_TIME_EPSILON = 1e-9;

/** Si la variación total de los datos es menor a esto, se consideran todos iguales. */
const TINY_VARIATION = 1e-20;

/** Un ajuste cuyos residuos suman menos que esto reproduce bien una constante. */
const TINY_RESIDUAL = 1e-12;

export function mean(values: readonly number[]): number {
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/**
 * Coeficiente de determinación: R² = 1 − SSres / SStot.
 *   SSres = Σ (observado − ajustado)²
 *   SStot = Σ (observado − promedio)²
 *
 * 1 es un ajuste perfecto. No se recorta a [0, 1]: por redondeo puede salir 0.9999999999999999.
 *
 * Caso especial: si todos los valores observados son iguales, SStot es 0 y la fórmula divide
 * por cero. Se devuelve 1 si el ajuste reproduce esa constante (residuos casi 0) y 0 si no.
 */
export function rSquared(observed: readonly number[], fitted: readonly number[]): number {
  const m = mean(observed);
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < observed.length; i++) {
    ssRes += (observed[i] - fitted[i]) ** 2;
    ssTot += (observed[i] - m) ** 2;
  }
  if (ssTot < TINY_VARIATION) return ssRes < TINY_RESIDUAL ? 1 : 0;
  return 1 - ssRes / ssTot;
}

/**
 * Valida la entrada de un ajuste. Devuelve false si:
 *  - los arreglos tienen distinta longitud,
 *  - hay menos de `minPoints` puntos,
 *  - hay NaN o valores infinitos,
 *  - hay menos de `minDistinctTimes` tiempos distintos.
 * No modifica los arreglos recibidos.
 */
export function isValidFitInput(
  times: readonly number[],
  values: readonly number[],
  minPoints: number,
  minDistinctTimes: number,
): boolean {
  if (times.length !== values.length || times.length < minPoints) return false;
  if (!times.every(Number.isFinite) || !values.every(Number.isFinite)) return false;

  const sorted = [...times].sort((a, b) => a - b);
  let distinct = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > SAME_TIME_EPSILON) distinct++;
  }
  return distinct >= minDistinctTimes;
}