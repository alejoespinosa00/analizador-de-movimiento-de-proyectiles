import { describe, expect, it } from 'vitest';
import { fitProjectile } from '../../src/physics/projectile';
import { MIN_R2_X, MIN_R2_Y, assessReliability } from '../../src/physics/reliability';
import { RELIABLE_POINTS } from '../../src/physics/validation';
import type { ProjectileResults, VideoInfo } from '../../src/types/analysis';
import { generateSyntheticTrajectory } from '../helpers/syntheticTrajectory';

const makeVideo = (fpsSource: VideoInfo['fpsSource'] = 'user'): VideoInfo => ({
  fileName: 'lanzamiento.mp4',
  objectUrl: 'blob:prueba',
  width: 1280,
  height: 1080,
  duration: 5,
  fps: 30,
  fpsSource,
});

/** Trayectoria perfecta con `count` puntos y sus resultados ajustados. */
function setup(count = 15) {
  const { measurements } = generateSyntheticTrajectory({ count });
  const results = fitProjectile(measurements)!;
  return { measurements, results };
}

const codes = (issues: { code: string }[]) => issues.map((i) => i.code);

describe('assessReliability', () => {
  it('con datos buenos (R² = 1, muchos puntos, FPS confirmados) no hay advertencias', () => {
    const { measurements, results } = setup(15);
    expect(assessReliability(results, makeVideo('user'), measurements)).toEqual([]);
  });

  it('R² bajo en y(t) avisa, y el aviso nombra el valor', () => {
    const { measurements, results } = setup(15);
    const bad: ProjectileResults = {
      ...results,
      fit: { ...results.fit, yOfT: { ...results.fit.yOfT, r2: MIN_R2_Y - 0.1 } },
    };
    const issues = assessReliability(bad, makeVideo(), measurements);
    expect(codes(issues)).toEqual(['LOW_R2_Y']);
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].message).toContain('0.85');
  });

  it('R² bajo en x(t) avisa', () => {
    const { measurements, results } = setup(15);
    const bad: ProjectileResults = {
      ...results,
      fit: { ...results.fit, xOfT: { ...results.fit.xOfT, r2: MIN_R2_X - 0.1 } },
    };
    expect(codes(assessReliability(bad, makeVideo(), measurements))).toEqual(['LOW_R2_X']);
  });

  it('un R² justo en el umbral no avisa', () => {
    const { measurements, results } = setup(15);
    const edge: ProjectileResults = {
      ...results,
      fit: {
        yOfT: { ...results.fit.yOfT, r2: MIN_R2_Y },
        xOfT: { ...results.fit.xOfT, r2: MIN_R2_X },
      },
    };
    expect(assessReliability(edge, makeVideo(), measurements)).toEqual([]);
  });

  it('R² no numérico (NaN) se trata como ajuste malo', () => {
    const { measurements, results } = setup(15);
    const nan: ProjectileResults = {
      ...results,
      fit: { ...results.fit, yOfT: { ...results.fit.yOfT, r2: NaN } },
    };
    expect(codes(assessReliability(nan, makeVideo(), measurements))).toEqual(['LOW_R2_Y']);
  });

  it('menos de RELIABLE_POINTS puntos avisa; con exactamente RELIABLE_POINTS no', () => {
    const few = setup(RELIABLE_POINTS - 1);
    expect(codes(assessReliability(few.results, makeVideo(), few.measurements))).toEqual([
      'RESULT_FEW_POINTS',
    ]);
    const enough = setup(RELIABLE_POINTS);
    expect(assessReliability(enough.results, makeVideo(), enough.measurements)).toEqual([]);
  });

  it('el aviso de pocos puntos indica cuántos hay', () => {
    const { measurements, results } = setup(4);
    const [issue] = assessReliability(results, makeVideo(), measurements);
    expect(issue.message).toContain('4 puntos');
  });

  it('FPS sin confirmar avisa (estimados o medidos); confirmados no', () => {
    const { measurements, results } = setup(15);
    expect(codes(assessReliability(results, makeVideo('estimated'), measurements))).toEqual([
      'RESULT_FPS_NOT_CONFIRMED',
    ]);
    expect(codes(assessReliability(results, makeVideo('measured'), measurements))).toEqual([
      'RESULT_FPS_NOT_CONFIRMED',
    ]);
    expect(assessReliability(results, makeVideo('user'), measurements)).toEqual([]);
  });

  it('sin video no se evalúan los FPS', () => {
    const { measurements, results } = setup(15);
    expect(assessReliability(results, null, measurements)).toEqual([]);
  });

  it('acumula varias advertencias a la vez', () => {
    const { measurements, results } = setup(4);
    const bad: ProjectileResults = {
      ...results,
      fit: { yOfT: { ...results.fit.yOfT, r2: 0.5 }, xOfT: { ...results.fit.xOfT, r2: 0.5 } },
    };
    expect(codes(assessReliability(bad, makeVideo('estimated'), measurements))).toEqual([
      'LOW_R2_Y',
      'LOW_R2_X',
      'RESULT_FEW_POINTS',
      'RESULT_FPS_NOT_CONFIRMED',
    ]);
  });
});