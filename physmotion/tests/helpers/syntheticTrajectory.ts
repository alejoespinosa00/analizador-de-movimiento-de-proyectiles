import type { Measurement, ReferenceSystem } from '../../src/types/analysis';
import { pixelToPhysical } from '../../src/utils/coordinates';

/**
 * Generador de trayectorias sintéticas para pruebas.
 * Simula lo que haría un usuario real: hace clic sobre un balón que sigue una parábola
 * perfecta, con un pequeño error de clic en píxeles. Como la respuesta correcta se conoce de
 * antemano (`expected`), permite comprobar los cálculos sin depender de un video.
 *
 * Solo para tests: no se importa desde src/.
 *
 * Modelo (Y hacia arriba, t = 0 en el lanzamiento, fotograma 0):
 *   x(t) = x0 + v0·cos(θ)·t
 *   y(t) = y0 + v0·sin(θ)·t − ½·g·t²
 */

export interface SyntheticOptions {
  /** Gravedad en m/s². Por defecto 9.8. */
  g?: number;
  /** Rapidez inicial en m/s. Por defecto 7. */
  v0?: number;
  /** Ángulo de lanzamiento en grados sobre la horizontal. Por defecto 60. */
  angleDeg?: number;
  /** Posición inicial en metros. Por defecto (0, 2). */
  x0?: number;
  y0?: number;
  /** FPS del video simulado. Por defecto 30. */
  fps?: number;
  /** Cantidad de puntos. Por defecto 15. Se ignora si se indica `duration`. */
  count?: number;
  /** Duración cubierta por los puntos, en segundos. Si se indica, reemplaza a `count`. */
  duration?: number;
  /** Cada cuántos fotogramas se marca un punto. Por defecto 3. */
  frameStep?: number;
  /** Fotograma del primer punto (el lanzamiento está en el fotograma 0). Por defecto 0. */
  firstFrame?: number;
  /** Error de clic: cada coordenada se desvía un valor uniforme en [−noisePx, +noisePx]. Por defecto 0. */
  noisePx?: number;
  /** Escala del video en metros por píxel. Por defecto 0.005 (200 px = 1 m). */
  metersPerPixel?: number;
  /** Semilla del generador pseudoaleatorio. Misma semilla = mismos puntos. Por defecto 1. */
  seed?: number;
  /** Píxel del video donde está el origen (0, 0) del sistema de referencia. Por defecto (100, 1000). */
  originPx?: { x: number; y: number };
}

export interface SyntheticExpected {
  v0x: number;
  v0y: number;
  g: number;
  /** Tiempo hasta volver a y = 0 (raíz positiva de la parábola). */
  flightTime: number;
  /** Altura máxima alcanzada (valor de y, no medido desde y0). */
  maxHeight: number;
  /** Distancia horizontal recorrida hasta y = 0: v0x · flightTime. */
  range: number;
  /** Posición x al llegar a y = 0: x0 + v0x · flightTime. Es lo que calcula horizontalRange(m, n, T). */
  xAtLanding: number;
  /** Coeficientes exactos de los ajustes: y(t) = a·t² + b·t + c, x(t) = m·t + n. */
  fit: { a: number; b: number; c: number; m: number; n: number };
}

export interface SyntheticTrajectory {
  measurements: Measurement[];
  /** Sistema de referencia usado: pásenlo a las funciones que lo necesiten. */
  reference: ReferenceSystem;
  /** Respuestas teóricas, sin ruido. */
  expected: SyntheticExpected;
  /** Parámetros finales, con los valores por defecto ya aplicados. */
  params: Required<Omit<SyntheticOptions, 'duration'>> & { duration?: number };
}

/** Generador pseudoaleatorio con semilla (mulberry32). Devuelve números en [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSyntheticTrajectory(options: SyntheticOptions = {}): SyntheticTrajectory {
  const {
    g = 9.8,
    v0 = 7,
    angleDeg = 60,
    x0 = 0,
    y0 = 2,
    fps = 30,
    count = 15,
    duration,
    frameStep = 3,
    firstFrame = 0,
    noisePx = 0,
    metersPerPixel = 0.005,
    seed = 1,
    originPx = { x: 100, y: 1000 },
  } = options;

  if (!(fps > 0)) throw new Error('fps debe ser mayor que 0');
  if (!(metersPerPixel > 0)) throw new Error('metersPerPixel debe ser mayor que 0');
  if (!Number.isInteger(frameStep) || frameStep < 1) {
    throw new Error('frameStep debe ser un entero mayor o igual a 1');
  }
  if (!Number.isInteger(firstFrame) || firstFrame < 0) {
    throw new Error('firstFrame debe ser un entero mayor o igual a 0');
  }
  if (noisePx < 0) throw new Error('noisePx no puede ser negativo');

  const total = duration === undefined ? count : Math.floor((duration * fps) / frameStep) + 1;
  if (!Number.isInteger(total) || total < 1) {
    throw new Error('count debe ser un entero mayor o igual a 1 (o duration muy corta)');
  }

  // Escala: dos puntos separados 100 px que equivalen a 100 · metersPerPixel metros.
  const reference: ReferenceSystem = {
    origin: originPx,
    axisAngle: 0,
    scale: {
      pointA: { x: 0, y: 0 },
      pointB: { x: 100, y: 0 },
      realDistanceMeters: 100 * metersPerPixel,
    },
  };

  const theta = (angleDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(theta);
  const v0y = v0 * Math.sin(theta);
  const random = mulberry32(seed);

  const measurements: Measurement[] = [];
  for (let i = 0; i < total; i++) {
    const frameIndex = firstFrame + i * frameStep;
    const t = frameIndex / fps;

    // Posición teórica en metros.
    const x = x0 + v0x * t;
    const y = y0 + v0y * t - 0.5 * g * t * t;

    // Se dibujan siempre dos números aleatorios por punto: así, con la misma semilla,
    // cambiar noisePx no altera la secuencia.
    const noiseX = (random() * 2 - 1) * noisePx;
    const noiseY = (random() * 2 - 1) * noisePx;

    // Píxel del video: la Y de la pantalla crece hacia abajo.
    const pixel = {
      x: originPx.x + x / metersPerPixel + noiseX,
      y: originPx.y - y / metersPerPixel + noiseY,
    };

    measurements.push({
      id: `synthetic-${i}`,
      time: t,
      frameIndex,
      pixel,
      // Lo que obtendría la app a partir del clic (incluye el efecto del ruido).
      physical: pixelToPhysical(pixel, reference) ?? undefined,
    });
  }

  const flightTime = (v0y + Math.sqrt(v0y * v0y + 2 * g * y0)) / g;
  const expected: SyntheticExpected = {
    v0x,
    v0y,
    g,
    flightTime,
    maxHeight: v0y > 0 ? y0 + (v0y * v0y) / (2 * g) : y0,
    range: v0x * flightTime,
    xAtLanding: x0 + v0x * flightTime,
    fit: { a: -g / 2, b: v0y, c: y0, m: v0x, n: x0 },
  };

  return {
    measurements,
    reference,
    expected,
    params: {
      g,
      v0,
      angleDeg,
      x0,
      y0,
      fps,
      count,
      duration,
      frameStep,
      firstFrame,
      noisePx,
      metersPerPixel,
      seed,
      originPx,
    },
  };
}