import { describe, expect, it } from 'vitest';
import { fitLinear } from '../../src/physics/linearFit';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

function xSeries(options = {}) {
  const { measurements } = generateSyntheticTrajectory(options);
  return {
    times: measurements.map((m) => m.time),
    xs: measurements.map((m) => m.physical!.x),
  };
}

describe('fitLinear', () => {
  it('con la x del generador sin ruido recupera m = 3.5, n = 0 y R² = 1', () => {
    const { times, xs } = xSeries();
    const fit = fitLinear(times, xs)!;
    expect(fit.m).toBeCloseTo(3.5, 8);
    expect(fit.n).toBeCloseTo(0, 8);
    expect(fit.r2).toBeCloseTo(1, 8);
  });

  it('con datos a mano (2t + 1) recupera m = 2 y n = 1', () => {
    const fit = fitLinear([0, 1, 2, 3, 4], [1, 3, 5, 7, 9])!;
    expect(fit.m).toBeCloseTo(2, 10);
    expect(fit.n).toBeCloseTo(1, 10);
    expect(fit.r2).toBeCloseTo(1, 10);
  });

  it('con ruido de ±2 px, m queda cerca de 3.5 y R² es alto pero menor que 1', () => {
    const { times, xs } = xSeries({ noisePx: 2, seed: 4 });
    const fit = fitLinear(times, xs)!;
    expect(Math.abs(fit.m - 3.5)).toBeLessThan(0.05);
    expect(fit.r2).toBeLessThan(1);
    expect(fit.r2).toBeGreaterThan(0.99);
  });

  it('funciona con tiempos que no empiezan en 0', () => {
    const { times, xs } = xSeries({ firstFrame: 10 });
    expect(times[0]).toBeGreaterThan(0.3);
    const fit = fitLinear(times, xs)!;
    expect(fit.m).toBeCloseTo(3.5, 8);
    expect(fit.n).toBeCloseTo(0, 8);
  });

  it('con valores constantes da m = 0 y R² = 1', () => {
    const fit = fitLinear([0, 1, 2], [5, 5, 5])!;
    expect(fit.m).toBeCloseTo(0, 10);
    expect(fit.n).toBeCloseTo(5, 10);
    expect(fit.r2).toBe(1);
  });

  describe('entradas inválidas devuelven null', () => {
    it('un solo punto', () => expect(fitLinear([1], [2])).toBeNull());
    it('tiempos todos iguales', () => expect(fitLinear([1, 1, 1], [1, 2, 3])).toBeNull());
    it('NaN en los tiempos', () => expect(fitLinear([0, NaN, 2], [1, 2, 3])).toBeNull());
    it('NaN en los valores', () => expect(fitLinear([0, 1, 2], [1, NaN, 3])).toBeNull());
    it('infinito', () => expect(fitLinear([0, 1, 2], [1, Infinity, 3])).toBeNull());
    it('longitudes distintas', () => expect(fitLinear([0, 1, 2], [1, 2])).toBeNull());
    it('arreglos vacíos', () => expect(fitLinear([], [])).toBeNull());
  });

  it('no modifica los arreglos recibidos', () => {
    const times = Object.freeze([2, 0, 1]);
    const values = Object.freeze([5, 1, 3]);
    expect(() => fitLinear(times, values)).not.toThrow();
    expect(times).toEqual([2, 0, 1]);
    expect(values).toEqual([5, 1, 3]);
  });
});