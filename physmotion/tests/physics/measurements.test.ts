import { describe, expect, it } from 'vitest';
import {
  displacement,
  segmentMotions,
  totalDisplacement,
} from '../../src/physics/measurements';
import { fitProjectile } from '../../src/physics/projectile';
import type { Measurement } from '../../src/types/analysis';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

/** Medición con coordenadas físicas ya calculadas (30 FPS). */
function point(id: string, time: number, x: number, y: number): Measurement {
  return {
    id,
    time,
    frameIndex: Math.round(time * 30),
    pixel: { x: 0, y: 0 },
    physical: { x, y },
  };
}

describe('displacement', () => {
  it('calcula Δx, Δy y la distancia en línea recta', () => {
    const d = displacement({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(d.dx).toBe(3);
    expect(d.dy).toBe(4);
    expect(d.magnitude).toBe(5);
  });

  it('conserva el signo cuando el movimiento es hacia atrás o hacia abajo', () => {
    const d = displacement({ x: 2, y: 5 }, { x: 1, y: 2 });
    expect(d.dx).toBe(-1);
    expect(d.dy).toBe(-3);
    expect(d.magnitude).toBeCloseTo(Math.hypot(1, 3), 12);
  });
});

describe('segmentMotions', () => {
  it('calcula la velocidad media entre dos puntos', () => {
    const [s] = segmentMotions([point('a', 0, 0, 0), point('b', 2, 3, 4)]);
    expect(s.dt).toBe(2);
    expect(s.dx).toBe(3);
    expect(s.dy).toBe(4);
    expect(s.magnitude).toBe(5);
    expect(s.vx).toBe(1.5);
    expect(s.vy).toBe(2);
    expect(s.speed).toBe(2.5);
  });

  it('con N puntos devuelve N − 1 tramos y guarda fotogramas y tiempos de cada extremo', () => {
    const segs = segmentMotions([
      point('a', 0, 0, 0),
      point('b', 0.5, 1, 1),
      point('c', 1, 2, 0),
    ]);
    expect(segs.length).toBe(2);
    expect(segs[0].fromFrame).toBe(0);
    expect(segs[0].toFrame).toBe(15);
    expect(segs[1].fromTime).toBe(0.5);
    expect(segs[1].toTime).toBe(1);
  });

  it('en un tiro, vy pasa de positiva a negativa', () => {
    const segs = segmentMotions([
      point('a', 0, 0, 0),
      point('b', 1, 1, 2),
      point('c', 2, 2, 0),
    ]);
    expect(segs[0].vy).toBe(2);
    expect(segs[1].vy).toBe(-2);
  });

  it('ordena por tiempo aunque lleguen desordenados', () => {
    const list = [point('c', 1, 2, 0), point('a', 0, 0, 0), point('b', 0.5, 1, 1)];
    expect(segmentMotions(list)).toEqual(segmentMotions([...list].reverse()));
    expect(segmentMotions(list)[0].fromTime).toBe(0);
  });

  it('ignora los puntos sin escala', () => {
    const uncalibrated: Measurement = {
      id: 'sin-escala',
      time: 0.25,
      frameIndex: 8,
      pixel: { x: 5, y: 5 },
    };
    const segs = segmentMotions([point('a', 0, 0, 0), uncalibrated, point('b', 1, 1, 1)]);
    expect(segs.length).toBe(1);
    expect(segs[0].dt).toBe(1);
  });

  it('omite los pares con el mismo tiempo', () => {
    expect(segmentMotions([point('a', 1, 0, 0), point('b', 1, 5, 5)])).toEqual([]);
  });

  it('con menos de 2 puntos no hay tramos', () => {
    expect(segmentMotions([])).toEqual([]);
    expect(segmentMotions([point('a', 0, 0, 0)])).toEqual([]);
  });

  it('en una trayectoria sin ruido, vx es la del ajuste y vy coincide con b + 2·a·t del punto medio', () => {
    const { measurements } = generateSyntheticTrajectory({ count: 15 });
    const fit = fitProjectile(measurements)!.fit;
    const segs = segmentMotions(measurements);
    expect(segs.length).toBe(14);
    for (const s of segs) {
      const tMid = (s.fromTime + s.toTime) / 2;
      expect(s.vx).toBeCloseTo(fit.xOfT.m, 5);
      expect(s.vy).toBeCloseTo(fit.yOfT.b + 2 * fit.yOfT.a * tMid, 5);
    }
  });
});

describe('totalDisplacement', () => {
  it('va del primer al último punto por tiempo', () => {
    const d = totalDisplacement([
      point('c', 2, 6, 8),
      point('a', 0, 0, 0),
      point('b', 1, 1, 5),
    ])!;
    expect(d.dx).toBe(6);
    expect(d.dy).toBe(8);
    expect(d.magnitude).toBe(10);
  });

  it('con menos de 2 puntos con escala devuelve null', () => {
    expect(totalDisplacement([])).toBeNull();
    expect(totalDisplacement([point('a', 0, 0, 0)])).toBeNull();
  });
});