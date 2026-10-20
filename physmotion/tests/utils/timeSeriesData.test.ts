import { describe, expect, it } from 'vitest';
import { fitProjectile } from '../../src/physics/projectile';
import type { Measurement } from '../../src/types/analysis';
import {
  CURVE_SAMPLES,
  SERIES_KEYS,
  SERIES_META,
  timeSeriesData,
} from '../../src/utils/chartData';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

function setup(count = 15) {
  const { measurements } = generateSyntheticTrajectory({ count });
  const fit = fitProjectile(measurements)!.fit;
  return { measurements, fit };
}

describe('timeSeriesData', () => {
  it('x(t) e y(t): un punto por medición, con el tiempo y el valor en metros', () => {
    const { measurements, fit } = setup(15);
    const sorted = [...measurements].sort((a, b) => a.time - b.time);
    const x = timeSeriesData('x', measurements, fit).measured;
    const y = timeSeriesData('y', measurements, fit).measured;
    expect(x.length).toBe(15);
    expect(x[3]).toEqual({ x: sorted[3].time, y: sorted[3].physical!.x });
    expect(y[3]).toEqual({ x: sorted[3].time, y: sorted[3].physical!.y });
  });

  it('la curva ajustada tiene CURVE_SAMPLES puntos y va del primer al último tiempo', () => {
    const { measurements, fit } = setup(15);
    const sorted = [...measurements].sort((a, b) => a.time - b.time);
    const { fitted } = timeSeriesData('y', measurements, fit);
    expect(fitted.length).toBe(CURVE_SAMPLES);
    expect(fitted[0].x).toBeCloseTo(sorted[0].time, 9);
    expect(fitted[fitted.length - 1].x).toBeCloseTo(sorted[14].time, 9);
  });

  it('sin ruido, el ajuste de y(t) pasa por los puntos medidos en los extremos', () => {
    const { measurements, fit } = setup(15);
    const { measured, fitted } = timeSeriesData('y', measurements, fit);
    expect(fitted[0].y).toBeCloseTo(measured[0].y, 6);
    expect(fitted[fitted.length - 1].y).toBeCloseTo(measured[measured.length - 1].y, 6);
  });

  it('vx(t): hay N − 1 velocidades medias y todas valen la pendiente de x(t)', () => {
    const { measurements, fit } = setup(15);
    const { measured, fitted } = timeSeriesData('vx', measurements, fit);
    expect(measured.length).toBe(14);
    for (const p of measured) expect(p.y).toBeCloseTo(fit.xOfT.m, 5);
    for (const p of fitted) expect(p.y).toBe(fit.xOfT.m);
  });

  it('vy(t): el ajuste es b + 2·a·t, con pendiente −g', () => {
    const { measurements, fit } = setup(15);
    const { fitted } = timeSeriesData('vy', measurements, fit);
    const first = fitted[0];
    const last = fitted[fitted.length - 1];
    expect(first.y).toBeCloseTo(fit.yOfT.b + 2 * fit.yOfT.a * first.x, 9);
    const slope = (last.y - first.y) / (last.x - first.x);
    expect(slope).toBeCloseTo(2 * fit.yOfT.a, 6);
  });

  it('vy(t): sin ruido, la velocidad media entre puntos coincide con la del ajuste en el punto medio', () => {
    const { measurements, fit } = setup(15);
    const { measured } = timeSeriesData('vy', measurements, fit);
    for (const p of measured) {
      expect(p.y).toBeCloseTo(fit.yOfT.b + 2 * fit.yOfT.a * p.x, 5);
    }
  });

  it('con menos de 2 puntos no hay ajuste ni velocidades', () => {
    const { measurements, fit } = setup(5);
    const one = measurements.slice(0, 1);
    expect(timeSeriesData('vy', one, fit)).toEqual({ measured: [], fitted: [] });
    expect(timeSeriesData('y', [], fit)).toEqual({ measured: [], fitted: [] });
  });

  it('si dos puntos tienen el mismo tiempo, no se calcula velocidad entre ellos', () => {
    const { measurements, fit } = setup(5);
    const sameTime = measurements.slice(0, 3).map((m) => ({ ...m, time: 1 }));
    expect(timeSeriesData('vx', sameTime, fit).measured).toEqual([]);
  });

  it('ignora las mediciones sin coordenadas físicas', () => {
    const { measurements, fit } = setup(5);
    const uncalibrated: Measurement = {
      id: 'sin-escala',
      time: 99,
      frameIndex: 999,
      pixel: { x: 10, y: 10 },
    };
    expect(timeSeriesData('x', [...measurements, uncalibrated], fit).measured.length).toBe(5);
  });

  it('los datos no dependen del orden en que llegan las mediciones', () => {
    const { measurements, fit } = setup(8);
    const a = timeSeriesData('vy', measurements, fit);
    const b = timeSeriesData('vy', [...measurements].reverse(), fit);
    expect(b).toEqual(a);
  });

  it('cada serie tiene sus textos y eje definidos', () => {
    expect(SERIES_KEYS).toEqual(['x', 'y', 'vx', 'vy']);
    for (const key of SERIES_KEYS) {
      expect(SERIES_META[key].label).toContain(key);
      expect(SERIES_META[key].axisLabel.length).toBeGreaterThan(0);
    }
  });
});