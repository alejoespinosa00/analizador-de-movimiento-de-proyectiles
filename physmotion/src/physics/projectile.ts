import type { Measurement, PhysicalPoint, ProjectileResults, ResultValue } from '../types/analysis';
import { fitLinear } from './linearFit';
import { fitQuadratic } from './quadraticFit';

/**
 * Cálculo del movimiento de proyectil a partir de los puntos medidos.
 *
 * Modelo (x hacia la derecha, y hacia arriba, en metros; t en segundos, con t = 0 en el
 * primer punto marcado):
 *   x(t) = n + m·t                 →  v0x = m
 *   y(t) = c + b·t + a·t²          →  v0y = b,  g = −2a
 *
 * Todo lo que sale de un ajuste es un valor ESTIMADO (README, sección 5). Las velocidades son
 * las de t = 0, es decir, las del primer punto marcado, que coincide con el lanzamiento solo
 * si el usuario empezó a marcar en ese fotograma.
 */

/**
 * Si |a| es menor que esto, la curva es casi una recta y no hay un tiempo de vuelo ni una
 * altura máxima con sentido (por redondeo, a podría salir −1e-16 en vez de 0).
 */
const NEARLY_FLAT = 1e-9;

function estimated(value: number, unit: string, equation: string): ResultValue {
  return { value, unit, source: 'estimated', equation };
}

type Calibrated = Measurement & { physical: PhysicalPoint };

/**
 * Ajusta x(t) (recta) e y(t) (parábola) y deriva velocidades, ángulo, gravedad, tiempo de
 * vuelo, altura máxima y alcance.
 *
 * Usa solo los puntos que tienen `physical` (es decir, con origen y escala definidos).
 * Devuelve null si no alcanzan para ajustar (ver fitLinear y fitQuadratic).
 */
export function fitProjectile(measurements: Measurement[]): ProjectileResults | null {
  const points = measurements.filter((m): m is Calibrated => m.physical !== undefined);
  const times = points.map((m) => m.time);

  const xFit = fitLinear(
    times,
    points.map((m) => m.physical.x),
  );
  const yFit = fitQuadratic(
    times,
    points.map((m) => m.physical.y),
  );
  if (!xFit || !yFit) return null;

  const { m, n, r2: r2x } = xFit;
  const { a, b, c, r2: r2y } = yFit;
  const v0x = m;
  const v0y = b;

  const results: ProjectileResults = {
    fit: { xOfT: { m, n, r2: r2x }, yOfT: { a, b, c, r2: r2y } },
    v0x: estimated(v0x, 'm/s', 'x(t) = x0 + v0x·t  →  v0x es la pendiente de x(t)'),
    v0y: estimated(v0y, 'm/s', 'y(t) = y0 + v0y·t − ½·g·t²  →  v0y es el coeficiente de t'),
    v0: estimated(Math.hypot(v0x, v0y), 'm/s', 'v0 = √(v0x² + v0y²)'),
    // Con |v0x| el ángulo se mide sobre la horizontal sin importar hacia dónde va el balón.
    launchAngleDeg: estimated(
      (Math.atan2(v0y, Math.abs(v0x)) * 180) / Math.PI,
      '°',
      'θ = atan(v0y / |v0x|)',
    ),
    gravity: estimated(-2 * a, 'm/s²', 'g = −2·a, con a el coeficiente de t² del ajuste de y(t)'),
  };

  const T = flightTime(a, b, c);
  if (T !== null) {
    results.flightTime = estimated(
      T,
      's',
      'Raíz mayor de a·t² + b·t + c = 0 (hasta volver a la altura del origen, y = 0)',
    );
    const range = horizontalRange(m, T);
    if (range !== null) {
      results.range = estimated(range, 'm', 'alcance = |v0x| · t_vuelo');
    }
  }

  const H = maxHeight(a, b, c);
  if (H !== null) {
    results.maxHeight = estimated(H, 'm', 'y_máx = c − b² / (4a)');
  }

  return results;
}

/**
 * Tiempo de vuelo: instante en que la altura vuelve a `yTarget` (por defecto 0, la altura del
 * origen), es decir, la raíz MAYOR de a·t² + b·t + (c − yTarget) = 0. Con la mayor se toma el
 * cruce en la bajada, también cuando el punto de partida ya está a la altura del objetivo.
 *
 * null si no hay un tiempo válido: la parábola no abre hacia abajo (a ≥ 0 o casi 0), no llega a
 * yTarget (discriminante negativo) o la raíz no es posterior a t = 0.
 */
export function flightTime(a: number, b: number, c: number, yTarget = 0): number | null {
  if (![a, b, c, yTarget].every(Number.isFinite) || a > -NEARLY_FLAT) return null;
  const discriminant = b * b - 4 * a * (c - yTarget);
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  const t = Math.max((-b + root) / (2 * a), (-b - root) / (2 * a));
  return t > 0 ? t : null;
}

/**
 * Altura máxima del movimiento desde t = 0: el vértice y(t*) = c − b²/(4a), con t* = −b/(2a).
 * Si el vértice quedó antes de t = 0 (el primer punto ya iba bajando), el máximo es c.
 * null si la parábola no abre hacia abajo (a ≥ 0 o casi 0).
 * Es una altura respecto al origen elegido, no necesariamente respecto al suelo.
 */
export function maxHeight(a: number, b: number, c: number): number | null {
  if (![a, b, c].every(Number.isFinite) || a > -NEARLY_FLAT) return null;
  const apexTime = -b / (2 * a);
  return apexTime >= 0 ? c - (b * b) / (4 * a) : c;
}

/**
 * Alcance horizontal: distancia recorrida en x durante el vuelo, |m|·T (siempre positiva).
 * m es la pendiente de x(t) y T el tiempo de vuelo.
 */
export function horizontalRange(m: number, flightTimeSeconds: number): number | null {
  if (!Number.isFinite(m) || !Number.isFinite(flightTimeSeconds) || flightTimeSeconds < 0) {
    return null;
  }
  return Math.abs(m) * flightTimeSeconds;
}
