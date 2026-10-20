import { describe, expect, it } from 'vitest';
import { buildProcedure } from '../../src/physics/procedure';
import { fitProjectile } from '../../src/physics/projectile';
import type { ReferenceSystem, VideoInfo } from '../../src/types/analysis';
import { formatNumber } from '../../src/utils/format';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

const video: VideoInfo = {
  fileName: 'lanzamiento.mp4',
  objectUrl: 'blob:prueba',
  width: 1280,
  height: 1080,
  duration: 5,
  fps: 30,
  fpsSource: 'user',
};

const reference: ReferenceSystem = {
  origin: { x: 0, y: 0 },
  axisAngle: 0,
  scale: { pointA: { x: 0, y: 0 }, pointB: { x: 100, y: 0 }, realDistanceMeters: 1 },
};

function setup() {
  const { measurements } = generateSyntheticTrajectory({ count: 15 });
  const results = fitProjectile(measurements)!;
  return { measurements, results };
}

describe('buildProcedure', () => {
  it('con todos los datos devuelve 8 pasos, empezando por la escala', () => {
    const { measurements, results } = setup();
    const steps = buildProcedure({ video, reference, measurements, results });
    expect(steps.length).toBe(8);
    expect(steps[0].title).toBe('Escala');
  });

  it('sin escala omite el paso de escala', () => {
    const { measurements, results } = setup();
    const steps = buildProcedure({
      video,
      reference: { ...reference, scale: null },
      measurements,
      results,
    });
    expect(steps.length).toBe(7);
    expect(steps.map((s) => s.title).includes('Escala')).toBe(false);
  });

  it('el paso de gravedad usa el mismo valor que los resultados', () => {
    const { measurements, results } = setup();
    const steps = buildProcedure({ video, reference, measurements, results });
    const gravity = steps.find((s) => s.title === 'Gravedad')!;
    expect(gravity.text).toContain(formatNumber(results.gravity.value, 3));
  });

  it('los FPS ingresados se describen como tales', () => {
    const { measurements, results } = setup();
    const steps = buildProcedure({ video, reference, measurements, results });
    expect(steps[1].text).toContain('ingresados por ti');
  });

  it('si no hay tiempo de vuelo, el último paso lo explica', () => {
    const { measurements, results } = setup();
    const noFlight = { ...results, flightTime: undefined, range: undefined };
    const steps = buildProcedure({ video, reference, measurements, results: noFlight });
    expect(steps[steps.length - 1].text).toContain('no vuelve');
  });
});
