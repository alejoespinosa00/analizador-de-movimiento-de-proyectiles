import { describe, expect, it } from 'vitest';
import { metersPerPixel } from '../../src/utils/coordinates';
import { generateSyntheticTrajectory } from './syntheticTrajectory';

describe('generateSyntheticTrajectory', () => {
  it('con los valores por defecto genera 15 puntos con tiempos crecientes e ids únicos', () => {
    const { measurements } = generateSyntheticTrajectory();
    expect(measurements).toHaveLength(15);
    for (let i = 1; i < measurements.length; i++) {
      expect(measurements[i].time).toBeGreaterThan(measurements[i - 1].time);
    }
    expect(new Set(measurements.map((m) => m.id)).size).toBe(15);
  });

  it('la misma semilla produce siempre los mismos puntos', () => {
    const a = generateSyntheticTrajectory({ noisePx: 2, seed: 7 });
    const b = generateSyntheticTrajectory({ noisePx: 2, seed: 7 });
    expect(a.measurements).toEqual(b.measurements);
  });

  it('otra semilla produce otros puntos', () => {
    const a = generateSyntheticTrajectory({ noisePx: 2, seed: 7 });
    const b = generateSyntheticTrajectory({ noisePx: 2, seed: 8 });
    expect(a.measurements).not.toEqual(b.measurements);
  });

  it('sin ruido, los puntos pertenecen exactamente a la parábola teórica', () => {
    const { measurements, params } = generateSyntheticTrajectory({ v0: 8, angleDeg: 50, g: 9.8 });
    const v0x = 8 * Math.cos((50 * Math.PI) / 180);
    const v0y = 8 * Math.sin((50 * Math.PI) / 180);
    for (const m of measurements) {
      expect(m.physical).toBeDefined();
      expect(m.physical!.x).toBeCloseTo(params.x0 + v0x * m.time, 8);
      expect(m.physical!.y).toBeCloseTo(params.y0 + v0y * m.time - 4.9 * m.time ** 2, 8);
    }
  });

  it('el ruido nunca supera ±noisePx en cada coordenada', () => {
    const clean = generateSyntheticTrajectory({ seed: 3 }).measurements;
    const noisy = generateSyntheticTrajectory({ seed: 3, noisePx: 2 }).measurements;
    let maxSeen = 0;
    noisy.forEach((m, i) => {
      const dx = Math.abs(m.pixel.x - clean[i].pixel.x);
      const dy = Math.abs(m.pixel.y - clean[i].pixel.y);
      expect(dx).toBeLessThanOrEqual(2);
      expect(dy).toBeLessThanOrEqual(2);
      maxSeen = Math.max(maxSeen, dx, dy);
    });
    expect(maxSeen).toBeGreaterThan(0); // sí hay ruido
  });

  it('cambiar noisePx no altera la secuencia aleatoria (misma semilla)', () => {
    const clean = generateSyntheticTrajectory({ seed: 5 }).measurements;
    const small = generateSyntheticTrajectory({ seed: 5, noisePx: 1 }).measurements;
    const big = generateSyntheticTrajectory({ seed: 5, noisePx: 2 }).measurements;
    small.forEach((m, i) => {
      const dxSmall = m.pixel.x - clean[i].pixel.x;
      const dxBig = big[i].pixel.x - clean[i].pixel.x;
      expect(dxBig).toBeCloseTo(dxSmall * 2, 8);
    });
  });

  it('calcula las respuestas teóricas (lanzamiento a 30° desde y = 0)', () => {
    const { expected } = generateSyntheticTrajectory({ v0: 10, angleDeg: 30, y0: 0, g: 9.8 });
    expect(expected.v0x).toBeCloseTo(8.660254, 5);
    expect(expected.v0y).toBeCloseTo(5, 8);
    expect(expected.flightTime).toBeCloseTo(10 / 9.8, 8); // 2·v0y/g
    expect(expected.maxHeight).toBeCloseTo(25 / 19.6, 8); // v0y²/(2g)
    expect(expected.range).toBeCloseTo((100 * Math.sin(Math.PI / 3)) / 9.8, 6); // v0²·sin(2θ)/g
  });

  it('la altura es 0 en el tiempo de vuelo esperado cuando se lanza desde y0 > 0', () => {
    const { expected, params } = generateSyntheticTrajectory();
    const T = expected.flightTime;
    const y = params.y0 + expected.v0y * T - 0.5 * params.g * T * T;
    expect(y).toBeCloseTo(0, 8);
  });

  it('expected.fit coincide con los coeficientes de la parábola', () => {
    const { expected } = generateSyntheticTrajectory({ v0: 6, angleDeg: 45, x0: 1, y0: 2, g: 9.8 });
    expect(expected.fit.a).toBeCloseTo(-4.9, 10);
    expect(expected.fit.b).toBeCloseTo(6 * Math.sin(Math.PI / 4), 10);
    expect(expected.fit.c).toBe(2);
    expect(expected.fit.m).toBeCloseTo(6 * Math.cos(Math.PI / 4), 10);
    expect(expected.fit.n).toBe(1);
    expect(expected.xAtLanding).toBeCloseTo(1 + expected.range, 10);
  });

  it('duration reemplaza a count', () => {
    // 1 s a 30 fps con un punto cada 3 fotogramas: 10 intervalos → 11 puntos
    const { measurements } = generateSyntheticTrajectory({ duration: 1, fps: 30, frameStep: 3 });
    expect(measurements).toHaveLength(11);
  });

  it('firstFrame permite que los tiempos no empiecen en 0', () => {
    const { measurements } = generateSyntheticTrajectory({ firstFrame: 10, fps: 30 });
    expect(measurements[0].frameIndex).toBe(10);
    expect(measurements[0].time).toBeCloseTo(10 / 30, 10);
  });

  it('la escala del sistema de referencia coincide con metersPerPixel', () => {
    const { reference } = generateSyntheticTrajectory({ metersPerPixel: 0.01 });
    expect(metersPerPixel(reference)).toBeCloseTo(0.01, 10);
  });

  it('rechaza parámetros inválidos', () => {
    expect(() => generateSyntheticTrajectory({ fps: 0 })).toThrow();
    expect(() => generateSyntheticTrajectory({ count: 0 })).toThrow();
    expect(() => generateSyntheticTrajectory({ frameStep: 0 })).toThrow();
    expect(() => generateSyntheticTrajectory({ frameStep: 1.5 })).toThrow();
    expect(() => generateSyntheticTrajectory({ metersPerPixel: -1 })).toThrow();
    expect(() => generateSyntheticTrajectory({ noisePx: -1 })).toThrow();
  });
});