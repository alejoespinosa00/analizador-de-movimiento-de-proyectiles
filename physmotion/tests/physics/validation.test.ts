import { describe, expect, it } from 'vitest';
import { MIN_POINTS, RELIABLE_POINTS, validateData } from '../../src/physics/validation';
import type { ReferenceSystem, ResultKey, VideoInfo } from '../../src/types/analysis';
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

/** Datos calibrados (origen y escala definidos) con `count` puntos. */
function data(count: number) {
  const { measurements, reference } = generateSyntheticTrajectory({ count });
  return { measurements, reference };
}

const codes = (issues: { code: string }[]) => issues.map((i) => i.code);
const allFalse = (c: Record<ResultKey, boolean>) => Object.values(c).every((v) => !v);
const allTrue = (c: Record<ResultKey, boolean>) => Object.values(c).every((v) => v);

describe('validateData', () => {
  it('con todo en orden: sin avisos y todo calculable', () => {
    const { measurements, reference } = data(8);
    const r = validateData(makeVideo(), reference, measurements);
    expect(r.issues).toEqual([]);
    expect(allTrue(r.canCompute)).toBe(true);
  });

  it('sin video: error y todo bloqueado', () => {
    const { measurements, reference } = data(8);
    const r = validateData(null, reference, measurements);
    expect(codes(r.issues)).toContain('NO_VIDEO');
    expect(allFalse(r.canCompute)).toBe(true);
  });

  it('sin origen: error y todo bloqueado', () => {
    const { measurements, reference } = data(8);
    const sinOrigen: ReferenceSystem = { ...reference, origin: null };
    const r = validateData(makeVideo(), sinOrigen, measurements);
    expect(codes(r.issues)).toContain('NO_ORIGIN');
    expect(allFalse(r.canCompute)).toBe(true);
  });

  it('bloquea todo sin escala', () => {
    const { measurements, reference } = data(8);
    const r = validateData(makeVideo(), { ...reference, scale: null }, measurements);
    expect(codes(r.issues)).toContain('NO_SCALE');
    expect(allFalse(r.canCompute)).toBe(true);
  });

  it('una escala con distancia 0 cuenta como sin escala', () => {
    const { measurements, reference } = data(8);
    const incompleta = { ...reference, scale: { ...reference.scale!, realDistanceMeters: 0 } };
    const r = validateData(makeVideo(), incompleta, measurements);
    expect(codes(r.issues)).toContain('NO_SCALE');
    expect(allFalse(r.canCompute)).toBe(true);
  });

  it('sin puntos: error con mensaje propio y nada calculable', () => {
    const { reference } = data(8);
    const r = validateData(makeVideo(), reference, []);
    const issue = r.issues.find((i) => i.code === 'TOO_FEW_POINTS')!;
    expect(issue.severity).toBe('error');
    expect(issue.message).toContain('Aún no hay puntos');
    expect(allFalse(r.canCompute)).toBe(true);
  });

  it('error con menos de 3 puntos', () => {
    const { measurements, reference } = data(2);
    const r = validateData(makeVideo(), reference, measurements);
    const issue = r.issues.find((i) => i.code === 'TOO_FEW_POINTS')!;
    expect(issue.severity).toBe('error');
    expect(r.canCompute.trajectory).toBe(false);
  });

  it('con 1 punto calibrado solo se puede ver la posición', () => {
    const { measurements, reference } = data(1);
    const r = validateData(makeVideo(), reference, measurements);
    expect(r.canCompute.position).toBe(true);
    expect(r.canCompute.velocity).toBe(false);
    expect(r.canCompute.trajectory).toBe(false);
  });

  it(`con ${MIN_POINTS} puntos ya se calcula, pero con advertencia`, () => {
    const { measurements, reference } = data(MIN_POINTS);
    const r = validateData(makeVideo(), reference, measurements);
    expect(codes(r.issues)).toEqual(['FEW_POINTS']);
    expect(r.issues[0].severity).toBe('warning');
    expect(allTrue(r.canCompute)).toBe(true);
  });

  it(`advertencia con menos de ${RELIABLE_POINTS} puntos y ninguna desde ${RELIABLE_POINTS}`, () => {
    const justBelow = data(RELIABLE_POINTS - 1);
    const enough = data(RELIABLE_POINTS);
    expect(
      codes(validateData(makeVideo(), justBelow.reference, justBelow.measurements).issues),
    ).toContain('FEW_POINTS');
    expect(
      codes(validateData(makeVideo(), enough.reference, enough.measurements).issues),
    ).not.toContain('FEW_POINTS');
  });

  it('advertencia si los FPS no fueron confirmados por el usuario', () => {
    const { measurements, reference } = data(8);
    const r = validateData(makeVideo('estimated'), reference, measurements);
    const issue = r.issues.find((i) => i.code === 'FPS_NOT_CONFIRMED')!;
    expect(issue.severity).toBe('warning');
    expect(allTrue(r.canCompute)).toBe(true); // advertir no bloquea
  });

  it('puntos repetidos en el mismo tiempo cuentan como uno solo', () => {
    const { measurements, reference } = data(8);
    const repetidos = measurements.map((m) => ({ ...m, time: 1 }));
    const r = validateData(makeVideo(), reference, repetidos);
    expect(codes(r.issues)).toContain('TOO_FEW_POINTS');
    expect(r.canCompute.trajectory).toBe(false);
  });

  it('los errores aparecen antes que las advertencias', () => {
    const { measurements, reference } = data(4);
    const r = validateData(makeVideo('estimated'), { ...reference, scale: null }, measurements);
    const severities = r.issues.map((i) => i.severity);
    expect(severities).toEqual(
      [...severities].sort((a, b) => (a === 'error' ? -1 : b === 'error' ? 1 : 0)),
    );
    expect(severities[0]).toBe('error');
    expect(severities[severities.length - 1]).toBe('warning');
  });
});