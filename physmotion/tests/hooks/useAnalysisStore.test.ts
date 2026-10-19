import { beforeEach, describe, expect, it } from 'vitest';
import { useAnalysisStore } from '../../src/hooks/useAnalysisStore';
import type { VideoInfo } from '../../src/types/analysis';

const store = useAnalysisStore;

const VIDEO: VideoInfo = {
  fileName: 'lanzamiento.mp4',
  objectUrl: 'blob:prueba',
  width: 1000,
  height: 800,
  duration: 5,
  fps: 30,
  fpsSource: 'user',
};

// 100 px = 1 m  →  0.01 m por píxel
const SCALE = { pointA: { x: 0, y: 0 }, pointB: { x: 100, y: 0 }, realDistanceMeters: 1 };

/** Marca un punto en el fotograma `frame`. */
function markAt(frame: number, x = 100, y = 100) {
  store.getState().setCurrentFrame(frame);
  store.getState().addMeasurementAt({ x, y });
}

beforeEach(() => {
  store.getState().reset();
  store.getState().setVideo(VIDEO);
});

describe('addMeasurementAt', () => {
  it('el primer punto fija t = 0 y los siguientes se miden desde él', () => {
    markAt(10);
    markAt(13);
    const { measurements, startFrame } = store.getState();
    expect(startFrame).toBe(10);
    expect(measurements.map((m) => m.time)).toEqual([0, 3 / 30]);
  });

  it('marcar otra vez en el mismo fotograma reemplaza el punto (mismo id)', () => {
    markAt(10, 100, 100);
    const idBefore = store.getState().measurements[0].id;
    markAt(10, 250, 300);
    const { measurements } = store.getState();
    expect(measurements).toHaveLength(1);
    expect(measurements[0].id).toBe(idBefore);
    expect(measurements[0].pixel).toEqual({ x: 250, y: 300 });
  });

  it('los puntos quedan ordenados por fotograma', () => {
    markAt(20);
    markAt(10);
    markAt(15);
    expect(store.getState().measurements.map((m) => m.frameIndex)).toEqual([10, 15, 20]);
  });

  it('un punto anterior al primero tiene tiempo negativo', () => {
    markAt(10);
    markAt(7);
    const times = store.getState().measurements.map((m) => m.time);
    expect(times[0]).toBeCloseTo(-0.1, 10);
    expect(times[1]).toBe(0);
  });

  it('sin video no agrega puntos', () => {
    store.getState().reset();
    store.getState().addMeasurementAt({ x: 1, y: 1 });
    expect(store.getState().measurements).toHaveLength(0);
  });
});

describe('metros', () => {
  it('sin origen ni escala no hay metros', () => {
    markAt(10);
    expect(store.getState().measurements[0].physical).toBeUndefined();
  });

  it('al definir origen y escala se recalculan los puntos ya marcados', () => {
    markAt(10, 300, 400);
    store.getState().setReference({ origin: { x: 100, y: 500 }, scale: SCALE });
    const p = store.getState().measurements[0].physical!;
    expect(p.x).toBeCloseTo(2, 10); // (300 − 100) px · 0.01
    expect(p.y).toBeCloseTo(1, 10); // (500 − 400) px · 0.01, con Y hacia arriba
  });

  it('un punto marcado con la referencia ya definida tiene metros de inmediato', () => {
    store.getState().setReference({ origin: { x: 100, y: 500 }, scale: SCALE });
    markAt(10, 300, 400);
    expect(store.getState().measurements[0].physical!.x).toBeCloseTo(2, 10);
  });

  it('con la escala incompleta (distancia 0) no hay metros', () => {
    store.getState().setReference({
      origin: { x: 100, y: 500 },
      scale: { ...SCALE, realDistanceMeters: 0 },
    });
    markAt(10, 300, 400);
    expect(store.getState().measurements[0].physical).toBeUndefined();
  });
});

describe('tiempo', () => {
  it('setStartFrame recalcula los tiempos', () => {
    markAt(10);
    markAt(16);
    store.getState().setStartFrame(13);
    const times = store.getState().measurements.map((m) => m.time);
    expect(times[0]).toBeCloseTo(-0.1, 10);
    expect(times[1]).toBeCloseTo(0.1, 10);
  });

  it('con cámara lenta (captureFps) el tiempo usa los FPS de grabación', () => {
    markAt(10);
    markAt(16);
    store.getState().updateVideo({ captureFps: 240 });
    expect(store.getState().measurements[1].time).toBeCloseTo(6 / 240, 10);
    markAt(20); // un punto nuevo también usa captureFps
    expect(store.getState().measurements[2].time).toBeCloseTo(10 / 240, 10);
  });
});

describe('borrar', () => {
  it('al borrar el último punto, t = 0 queda libre otra vez', () => {
    markAt(10);
    store.getState().removeMeasurement(store.getState().measurements[0].id);
    expect(store.getState().startFrame).toBe(0);
    markAt(25);
    expect(store.getState().startFrame).toBe(25);
  });

  it('borrar un punto intermedio no cambia t = 0', () => {
    markAt(10);
    markAt(13);
    markAt(16);
    store.getState().removeMeasurement(store.getState().measurements[1].id);
    expect(store.getState().startFrame).toBe(10);
    expect(store.getState().measurements).toHaveLength(2);
  });

  it('clearMeasurements borra todo y libera t = 0', () => {
    markAt(10);
    markAt(13);
    store.getState().clearMeasurements();
    expect(store.getState().measurements).toHaveLength(0);
    expect(store.getState().startFrame).toBe(0);
  });
});

describe('cambio de video', () => {
  it('setVideo reinicia la referencia, los puntos y el modo de selección', () => {
    store.getState().setReference({ origin: { x: 1, y: 2 }, scale: SCALE });
    store.getState().setPickMode('measure');
    markAt(10);

    store.getState().setVideo({ ...VIDEO, objectUrl: 'blob:otro' });

    const s = store.getState();
    expect(s.reference.origin).toBeNull();
    expect(s.reference.scale).toBeNull();
    expect(s.pickMode).toBeNull();
    expect(s.measurements).toHaveLength(0);
    expect(s.startFrame).toBe(0);
  });
});