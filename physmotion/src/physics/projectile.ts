import type { Measurement, ProjectileResults } from '../types/analysis';

/**
 * Ajuste por mínimos cuadrados:
 *   x(t) = m·t + n            (recta)
 *   y(t) = a·t² + b·t + c     (parábola)
 * Debe devolver también el R² de cada ajuste.
 * Requiere mediciones con `physical` definido.
 */
export function fitProjectile(_measurements: Measurement[]): ProjectileResults | null {
  // TODO(sprint-3): implementar (ver docs/BACKLOG.md).
  return null;
}

/** Tiempo de vuelo hasta volver a la altura yTarget (raíz positiva de la parábola). */
export function flightTime(_a: number, _b: number, _c: number, _yTarget = 0): number | null {
  // TODO(sprint-4)
  return null;
}

/** Altura máxima: y(t*) con t* = −b / (2a). */
export function maxHeight(_a: number, _b: number, _c: number): number | null {
  // TODO(sprint-4)
  return null;
}

/** Alcance horizontal: x(tVuelo). */
export function horizontalRange(_m: number, _n: number, _flightTime: number): number | null {
  // TODO(sprint-4)
  return null;
}
