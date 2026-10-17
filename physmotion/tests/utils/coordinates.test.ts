import { describe, expect, it } from 'vitest';
import { metersPerPixel, pixelToPhysical } from '../../src/utils/coordinates';
import type { ReferenceSystem } from '../../src/types/analysis';

const ref: ReferenceSystem = {
  origin: { x: 100, y: 500 },
  axisAngle: 0,
  scale: { pointA: { x: 0, y: 0 }, pointB: { x: 200, y: 0 }, realDistanceMeters: 2 },
};

describe('coordinates', () => {
  it('calcula metros por píxel', () => {
    expect(metersPerPixel(ref)).toBeCloseTo(0.01);
  });

  it('convierte píxeles a metros con Y hacia arriba', () => {
    const p = pixelToPhysical({ x: 200, y: 400 }, ref);
    expect(p?.x).toBeCloseTo(1);
    expect(p?.y).toBeCloseTo(1);
  });

  it('devuelve null sin escala', () => {
    expect(pixelToPhysical({ x: 0, y: 0 }, { ...ref, scale: null })).toBeNull();
  });
});
