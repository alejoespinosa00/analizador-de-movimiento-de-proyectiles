import { describe, expect, it } from 'vitest';
import { fitQuadratic } from '../../src/physics/quadraticFit';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

function ySeries(options = {}) {
  const { measurements } = generateSyntheticTrajectory(options);
  return {
    times: measurements.map((m) => m.time),
    ys: measurements.map((m) => m.physical!.y),
  };
}

const V0Y = 7 * Math.sin((60 * Math.PI) / 180); // ≈ 6.0622 (valores por defecto del generador)

describe('fitQuadratic', () => {
  it('con la y del generador sin ruido recupera a, b, c y R² = 1', () => {
    const { times, ys } = ySeries();
    const fit = fitQuadratic(times, ys)!;
    expect(fit.a).toBeCloseTo(-4.9, 8);
    expect(fit.b).toBeCloseTo(V0Y, 8);
    expect(fit.c).toBeCloseTo(2, 8);
    expect(fit.r2).toBeCloseTo(1, 8);
  });

  it('con 3 puntos a mano (0,2), (1,3), (2,2) recupera a = −1, b = 2, c = 2', () => {
    const fit = fitQuadratic([0, 1, 2], [2, 3, 2])!;
    expect(fit.a).toBeCloseTo(-1, 10);
    expect(fit.b).toBeCloseTo(2, 10);
    expect(fit.c).toBeCloseTo(2, 10);
    expect(fit.r2).toBeCloseTo(1, 10);
  });

  it('con tiempos que no empiezan en 0 devuelve los mismos coeficientes', () => {
    const { times, ys } = ySeries({ firstFrame: 10 });
    expect(times[0]).toBeGreaterThan(0.3);
    const fit = fitQuadratic(times, ys)!;
    expect(fit.a).toBeCloseTo(-4.9, 8);
    expect(fit.b).toBeCloseTo(V0Y, 8);
    expect(fit.c).toBeCloseTo(2, 8);
  });

  it('con tiempos muy cercanos (240 fps, 3 puntos) sigue recuperando la parábola', () => {
    const times = [0, 1 / 240, 2 / 240];
    const ys = times.map((t) => 2 + 6 * t - 4.9 * t * t);
    const fit = fitQuadratic(times, ys)!;
    expect(fit.a).toBeCloseTo(-4.9, 5);
    expect(fit.b).toBeCloseTo(6, 5);
    expect(fit.c).toBeCloseTo(2, 8);
  });

  it('con ruido de ±2 px y 15 puntos, la gravedad (−2a) queda en 9.8 ± 0.1 para 20 semillas', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { times, ys } = ySeries({ noisePx: 2, seed, count: 15 });
      const fit = fitQuadratic(times, ys)!;
      expect(Math.abs(-2 * fit.a - 9.8)).toBeLessThan(0.1);
      expect(fit.r2).toBeLessThan(1);
    }
  });

  it('con valores constantes da a = 0, b = 0 y c = 5', () => {
    const fit = fitQuadratic([0, 1, 2, 3], [5, 5, 5, 5])!;
    expect(fit.a).toBeCloseTo(0, 10);
    expect(fit.b).toBeCloseTo(0, 10);
    expect(fit.c).toBeCloseTo(5, 10);
    expect(fit.r2).toBe(1);
  });

  describe('entradas inválidas devuelven null', () => {
    it('menos de 3 puntos', () => expect(fitQuadratic([0, 1], [1, 2])).toBeNull());
    it('solo 2 tiempos distintos', () =>
      expect(fitQuadratic([0, 0, 1, 1], [1, 2, 3, 4])).toBeNull());
    it('tiempos repetidos', () => expect(fitQuadratic([1, 1, 1, 1], [1, 2, 3, 4])).toBeNull());
    it('NaN', () => expect(fitQuadratic([0, 1, NaN], [1, 2, 3])).toBeNull());
    it('longitudes distintas', () => expect(fitQuadratic([0, 1, 2], [1, 2])).toBeNull());
    it('arreglos vacíos', () => expect(fitQuadratic([], [])).toBeNull());
  });

  it('no modifica los arreglos recibidos', () => {
    const times = Object.freeze([2, 0, 1, 3]);
    const values = Object.freeze([5, 1, 3, 9]);
    expect(() => fitQuadratic(times, values)).not.toThrow();
    expect(times).toEqual([2, 0, 1, 3]);
    expect(values).toEqual([5, 1, 3, 9]);
  });
});