import { describe, expect, it } from 'vitest';
import { fitProjectile } from '../../src/physics/projectile';
import type { Measurement } from '../../src/types/analysis';
import { CURVE_SAMPLES, trajectoryChartData } from '../../src/utils/chartData';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

function setup(count = 15) {
  const { measurements } = generateSyntheticTrajectory({ count });
  const fit = fitProjectile(measurements)!.fit;
  return { measurements, fit };
}

describe('trajectoryChartData', () => {
  it('devuelve un punto medido por cada medición con coordenadas físicas', () => {
    const { measurements, fit } = setup(15);
    const { measured } = trajectoryChartData(measurements, fit);
    expect(measured.length).toBe(15);
  });

  it('la curva tiene CURVE_SAMPLES puntos por defecto y el número pedido si se indica', () => {
    const { measurements, fit } = setup(15);
    expect(trajectoryChartData(measurements, fit).curve.length).toBe(CURVE_SAMPLES);
    expect(trajectoryChartData(measurements, fit, 10).curve.length).toBe(10);
  });

  it('sin ruido, la curva empieza y termina en el primer y el último punto medido', () => {
    const { measurements, fit } = setup(15);
    const { measured, curve } = trajectoryChartData(measurements, fit);
    const first = measured[0];
    const last = measured[measured.length - 1];
    expect(curve[0].x).toBeCloseTo(first.x, 6);
    expect(curve[0].y).toBeCloseTo(first.y, 6);
    expect(curve[curve.length - 1].x).toBeCloseTo(last.x, 6);
    expect(curve[curve.length - 1].y).toBeCloseTo(last.y, 6);
  });

  it('los puntos medidos salen ordenados por tiempo aunque lleguen desordenados', () => {
    const { measurements, fit } = setup(8);
    const sorted = trajectoryChartData(measurements, fit).measured;
    const shuffled = trajectoryChartData([...measurements].reverse(), fit).measured;
    expect(shuffled).toEqual(sorted);
  });

  it('ignora las mediciones sin coordenadas físicas', () => {
    const { measurements, fit } = setup(5);
    const uncalibrated: Measurement = {
      id: 'sin-escala',
      time: 99,
      frameIndex: 999,
      pixel: { x: 10, y: 10 },
    };
    const { measured } = trajectoryChartData([...measurements, uncalibrated], fit);
    expect(measured.length).toBe(5);
  });

  it('con menos de 2 puntos no hay curva', () => {
    const { measurements, fit } = setup(5);
    expect(trajectoryChartData(measurements.slice(0, 1), fit).curve).toEqual([]);
    expect(trajectoryChartData([], fit).curve).toEqual([]);
  });

  it('si todos los puntos tienen el mismo tiempo no hay curva', () => {
    const { measurements, fit } = setup(5);
    const sameTime = measurements.slice(0, 3).map((m) => ({ ...m, time: 1 }));
    expect(trajectoryChartData(sameTime, fit).curve).toEqual([]);
  });
});
