import { describe, expect, it } from 'vitest';
import {
  fitProjectile,
  flightTime,
  horizontalRange,
  maxHeight,
} from '../../src/physics/projectile';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

// Parábola de ejemplo: v0 = 7 m/s a 60° desde y0 = 2 m  →  a = −4.9, b ≈ 6.0622, c = 2
const B = 7 * Math.sin((60 * Math.PI) / 180);

describe('fitProjectile', () => {
  it('sin ruido recupera velocidades, ángulo, gravedad, tiempo de vuelo, altura y alcance', () => {
    const { measurements, expected } = generateSyntheticTrajectory();
    const r = fitProjectile(measurements)!;
    expect(r.v0x.value).toBeCloseTo(expected.v0x, 6);
    expect(r.v0y.value).toBeCloseTo(expected.v0y, 6);
    expect(r.v0.value).toBeCloseTo(7, 6);
    expect(r.launchAngleDeg.value).toBeCloseTo(60, 6);
    expect(r.gravity.value).toBeCloseTo(9.8, 6);
    expect(r.flightTime!.value).toBeCloseTo(expected.flightTime, 6);
    expect(r.maxHeight!.value).toBeCloseTo(expected.maxHeight, 6);
    expect(r.range!.value).toBeCloseTo(expected.range, 6);
  });

  it('devuelve los coeficientes de los ajustes con R² = 1', () => {
    const { measurements, expected } = generateSyntheticTrajectory();
    const { fit } = fitProjectile(measurements)!;
    expect(fit.yOfT.a).toBeCloseTo(expected.fit.a, 6);
    expect(fit.yOfT.b).toBeCloseTo(expected.fit.b, 6);
    expect(fit.yOfT.c).toBeCloseTo(expected.fit.c, 6);
    expect(fit.xOfT.m).toBeCloseTo(expected.fit.m, 6);
    expect(fit.xOfT.n).toBeCloseTo(expected.fit.n, 6);
    expect(fit.yOfT.r2).toBeCloseTo(1, 8);
    expect(fit.xOfT.r2).toBeCloseTo(1, 8);
  });

  it('todos los resultados son estimados y traen unidad y ecuación', () => {
    const r = fitProjectile(generateSyntheticTrajectory().measurements)!;
    const values = [
      r.v0x,
      r.v0y,
      r.v0,
      r.launchAngleDeg,
      r.gravity,
      r.flightTime,
      r.maxHeight,
      r.range,
    ];
    for (const v of values) {
      expect(v).toBeDefined();
      expect(v!.source).toBe('estimated');
      expect(v!.unit.length).toBeGreaterThan(0);
      expect(v!.equation).toBeTruthy();
    }
  });

  it('con ruido de ±2 px y 15 puntos, los resultados quedan cerca de los reales (20 semillas)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { measurements, expected } = generateSyntheticTrajectory({ noisePx: 2, seed });
      const r = fitProjectile(measurements)!;
      expect(Math.abs(r.gravity.value - 9.8)).toBeLessThan(0.1);
      expect(Math.abs(r.v0.value - 7)).toBeLessThan(0.1);
      expect(Math.abs(r.launchAngleDeg.value - 60)).toBeLessThan(0.5);
      expect(Math.abs(r.flightTime!.value - expected.flightTime)).toBeLessThan(0.02);
      expect(Math.abs(r.maxHeight!.value - expected.maxHeight)).toBeLessThan(0.05);
      expect(Math.abs(r.range!.value - expected.range)).toBeLessThan(0.1);
      expect(r.fit.yOfT.r2).toBeLessThan(1);
    }
  });

  it('con tiempos que no empiezan en 0 da los mismos resultados', () => {
    const { measurements } = generateSyntheticTrajectory({ firstFrame: 10 });
    expect(measurements[0].time).toBeGreaterThan(0.3);
    const r = fitProjectile(measurements)!;
    expect(r.gravity.value).toBeCloseTo(9.8, 6);
    expect(r.v0.value).toBeCloseTo(7, 6);
  });

  it('un lanzamiento hacia la izquierda da v0x negativo, pero ángulo y alcance positivos', () => {
    const { measurements, expected } = generateSyntheticTrajectory({ angleDeg: 120 });
    const r = fitProjectile(measurements)!;
    expect(r.v0x.value).toBeLessThan(0);
    expect(r.launchAngleDeg.value).toBeCloseTo(60, 6);
    expect(r.range!.value).toBeCloseTo(Math.abs(expected.range), 6);
  });

  it('con exactamente 3 puntos exactos también ajusta', () => {
    const r = fitProjectile(generateSyntheticTrajectory({ count: 3 }).measurements)!;
    expect(r.gravity.value).toBeCloseTo(9.8, 6);
  });

  it('con menos de 3 puntos devuelve null', () => {
    expect(fitProjectile(generateSyntheticTrajectory({ count: 2 }).measurements)).toBeNull();
    expect(fitProjectile([])).toBeNull();
  });

  it('sin metros (sin origen o escala) devuelve null', () => {
    const sinMetros = generateSyntheticTrajectory().measurements.map((m) => ({
      ...m,
      physical: undefined,
    }));
    expect(fitProjectile(sinMetros)).toBeNull();
  });

  it('ignora los puntos que no tienen metros y usa el resto', () => {
    const { measurements } = generateSyntheticTrajectory();
    const mezcla = measurements.map((m, i) => (i < 3 ? { ...m, physical: undefined } : m));
    const r = fitProjectile(mezcla)!;
    expect(r.gravity.value).toBeCloseTo(9.8, 6);
  });

  it('una trayectoria recta no inventa tiempo de vuelo ni altura máxima', () => {
    const recta = generateSyntheticTrajectory({ g: 0 });
    const r = fitProjectile(recta.measurements)!;
    expect(r.gravity.value).toBeCloseTo(0, 6);
    expect(r.flightTime).toBeUndefined();
    expect(r.maxHeight).toBeUndefined();
    expect(r.range).toBeUndefined();
  });
});

describe('flightTime', () => {
  it('desde 2 m de altura hasta y = 0', () => {
    const expected = (B + Math.sqrt(B * B + 4 * 4.9 * 2)) / (2 * 4.9);
    expect(flightTime(-4.9, B, 2)).toBeCloseTo(expected, 8);
    expect(flightTime(-4.9, B, 2)).toBeCloseTo(1.50787, 4);
  });

  it('si parte de y = 0 toma la raíz mayor (2·v0y/g), no la de t = 0', () => {
    expect(flightTime(-4.9, 5, 0)).toBeCloseTo(5 / 4.9, 8);
  });

  it('con otra altura objetivo toma el cruce en la bajada', () => {
    const t = flightTime(-4.9, B, 2, 3)!;
    expect(t).toBeCloseTo((B + Math.sqrt(B * B - 4 * 4.9 * 1)) / (2 * 4.9), 8);
    // y(t) vuelve a valer 3 m
    expect(2 + B * t - 4.9 * t * t).toBeCloseTo(3, 8);
  });

  it('parte de arriba y baja: cruza y = 0 en un tiempo positivo', () => {
    expect(flightTime(-4.9, -5, 1)).toBeCloseTo(0.171, 2);
  });

  it('null si nunca llega a la altura objetivo', () => {
    expect(flightTime(-4.9, B, 2, 10)).toBeNull();
  });

  it('null si ya está por debajo del objetivo y sigue bajando', () => {
    expect(flightTime(-4.9, -5, -1)).toBeNull();
  });

  it('null si la parábola no abre hacia abajo o es casi una recta', () => {
    expect(flightTime(0, B, 2)).toBeNull();
    expect(flightTime(4.9, B, 2)).toBeNull();
    expect(flightTime(-1e-12, B, 2)).toBeNull();
  });

  it('null con valores no finitos', () => {
    expect(flightTime(NaN, B, 2)).toBeNull();
    expect(flightTime(-4.9, Infinity, 2)).toBeNull();
  });
});

describe('maxHeight', () => {
  it('el vértice de la parábola: c − b²/(4a)', () => {
    expect(maxHeight(-4.9, B, 2)).toBeCloseTo(3.875, 8);
  });

  it('si el vértice quedó antes de t = 0, el máximo es c', () => {
    expect(maxHeight(-4.9, -3, 2)).toBe(2);
    expect(maxHeight(-4.9, 0, 2)).toBe(2);
  });

  it('null si la parábola no abre hacia abajo o es casi una recta', () => {
    expect(maxHeight(0, B, 2)).toBeNull();
    expect(maxHeight(4.9, B, 2)).toBeNull();
    expect(maxHeight(-1e-12, B, 2)).toBeNull();
  });

  it('null con valores no finitos', () => {
    expect(maxHeight(NaN, B, 2)).toBeNull();
  });
});

describe('horizontalRange', () => {
  it('distancia recorrida: |m|·T', () => {
    expect(horizontalRange(3.5, 1.5079)).toBeCloseTo(5.27765, 4);
  });

  it('siempre es positiva, aunque el balón vaya hacia la izquierda', () => {
    expect(horizontalRange(-3.5, 2)).toBeCloseTo(7, 10);
  });

  it('con T = 0 da 0', () => {
    expect(horizontalRange(3.5, 0)).toBe(0);
  });

  it('null con tiempo negativo o valores no finitos', () => {
    expect(horizontalRange(3.5, -1)).toBeNull();
    expect(horizontalRange(NaN, 2)).toBeNull();
    expect(horizontalRange(3.5, Infinity)).toBeNull();
  });
});