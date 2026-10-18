import { isValidFitInput, mean, rSquared } from './fitStats';

/**
 * Ajuste cuadrático por mínimos cuadrados: y(t) = a·t² + b·t + c.
 * En un proyectil: g = −2·a, v0y = b (velocidad vertical en t = 0) y c = y(0).
 *
 * Estrategia: se CENTRA el tiempo (u = t − promedio) antes de resolver. Con tiempos
 * grandes, t⁴ crece mucho y el sistema pierde precisión; con u los valores son pequeños.
 *
 * 1. Se resuelven las ecuaciones normales de y = A·u² + B·u + C:
 *      [ N    Σu   Σu² ] [C]   [ Σy    ]
 *      [ Σu   Σu²  Σu³ ] [B] = [ Σu·y  ]
 *      [ Σu²  Σu³  Σu⁴ ] [A]   [ Σu²·y ]
 * 2. Se vuelve a la variable original expandiendo A·(t−tm)² + B·(t−tm) + C:
 *      a = A,   b = B − 2·A·tm,   c = A·tm² − B·tm + C
 *
 * @param times  tiempos en segundos (medidos desde el fotograma t = 0)
 * @param values posiciones en metros
 * @returns { a, b, c, r2 }, o null si los datos no alcanzan: arreglos de distinta longitud,
 *          menos de 3 puntos, menos de 3 tiempos distintos, valores no finitos o sistema
 *          casi singular.
 */
export function fitQuadratic(
  times: readonly number[],
  values: readonly number[],
): { a: number; b: number; c: number; r2: number } | null {
  if (!isValidFitInput(times, values, 3, 3)) return null;

  const n = times.length;
  const tm = mean(times);

  let s1 = 0;
  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < n; i++) {
    const u = times[i] - tm;
    const u2 = u * u;
    s1 += u;
    s2 += u2;
    s3 += u2 * u;
    s4 += u2 * u2;
    b0 += values[i];
    b1 += u * values[i];
    b2 += u2 * values[i];
  }

  const solution = solve3x3(
    [
      [n, s1, s2],
      [s1, s2, s3],
      [s2, s3, s4],
    ],
    [b0, b1, b2],
  );
  if (!solution) return null;

  const [C, B, A] = solution;
  const a = A;
  const b = B - 2 * A * tm;
  const c = A * tm * tm - B * tm + C;
  if (![a, b, c].every(Number.isFinite)) return null;

  const fitted = times.map((t) => a * t * t + b * t + c);
  return { a, b, c, r2: rSquared(values, fitted) };
}

/** Pivote con valor absoluto menor a esto: el sistema es casi singular. */
const MIN_PIVOT = 1e-12;

/** Eliminación gaussiana con pivoteo parcial. Devuelve null si el sistema es casi singular. */
function solve3x3(matrix: number[][], rhs: number[]): number[] | null {
  const m = matrix.map((row, i) => [...row, rhs[i]]); // matriz aumentada, copia

  for (let col = 0; col < 3; col++) {
    // Pivoteo parcial: la fila con mayor valor absoluto en esta columna.
    let pivot = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }
    if (Math.abs(m[pivot][col]) < MIN_PIVOT) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];

    for (let row = col + 1; row < 3; row++) {
      const factor = m[row][col] / m[col][col];
      for (let k = col; k < 4; k++) m[row][k] -= factor * m[col][k];
    }
  }

  // Sustitución hacia atrás.
  const x = [0, 0, 0];
  for (let row = 2; row >= 0; row--) {
    let sum = m[row][3];
    for (let k = row + 1; k < 3; k++) sum -= m[row][k] * x[k];
    x[row] = sum / m[row][row];
  }
  return x;
}