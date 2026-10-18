import { describe, expect, it } from 'vitest';
import { estimateFpsFromTimestamps } from '../../src/utils/fpsEstimate';

/** Tiempos exactos de `count` fotogramas a `fps` (0, 1/fps, 2/fps, ...). */
function makeTimes(fps: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => i / fps);
}

describe('estimateFpsFromTimestamps', () => {
  describe('FPS habituales', () => {
    it('30 fps con 31 tiempos: confianza alta y no variable', () => {
      const r = estimateFpsFromTimestamps(makeTimes(30, 31));
      expect(r.fps).toBe(30);
      expect(r.confidence).toBe('high');
      expect(r.isVariable).toBe(false);
      expect(r.diffCount).toBe(30);
    });

    it.each([24, 25, 30, 50, 60, 120, 240])('recupera %i fps', (fps) => {
      expect(estimateFpsFromTimestamps(makeTimes(fps, 31)).fps).toBe(fps);
    });

    it('29.97 fps se sugiere como 30 y rawFps conserva el valor medido', () => {
      const r = estimateFpsFromTimestamps(makeTimes(29.97, 31));
      expect(r.fps).toBe(30);
      expect(r.rawFps).toBeCloseTo(29.97, 2);
    });

    it('un valor no habitual (25.5) no se redondea', () => {
      const r = estimateFpsFromTimestamps(makeTimes(25.5, 31));
      expect(r.fps).toBeCloseTo(25.5, 2);
    });
  });

  describe('ruido y pérdidas', () => {
    it('30 fps con ruido de ±1 ms sigue dando 30', () => {
      const times = makeTimes(30, 31).map((t, i) => t + (i % 2 === 0 ? -0.001 : 0.001));
      const r = estimateFpsFromTimestamps(times);
      expect(r.fps).toBe(30);
      expect(r.isVariable).toBe(false);
    });

    it('un fotograma perdido a mitad de la serie no cambia el resultado', () => {
      const times = makeTimes(30, 31);
      times.splice(15, 1);
      const r = estimateFpsFromTimestamps(times);
      expect(r.fps).toBe(30);
      expect(r.confidence).toBe('high');
    });
  });

  describe('FPS variable', () => {
    it('intervalos alternados de 1/24 y 1/60 se marcan como variables con confianza baja', () => {
      const times = [0];
      for (let i = 0; i < 30; i++) times.push(times[i] + (i % 2 === 0 ? 1 / 24 : 1 / 60));
      const r = estimateFpsFromTimestamps(times);
      expect(r.isVariable).toBe(true);
      expect(r.confidence).toBe('low');
    });
  });

  describe('pocas muestras', () => {
    it('5 tiempos a 30 fps: da 30 pero con confianza baja', () => {
      const r = estimateFpsFromTimestamps(makeTimes(30, 5));
      expect(r.fps).toBe(30);
      expect(r.confidence).toBe('low');
    });

    it('3 tiempos (2 intervalos): no estima', () => {
      const r = estimateFpsFromTimestamps(makeTimes(30, 3));
      expect(r.fps).toBeNull();
      expect(r.rawFps).toBeNull();
      expect(r.confidence).toBe('low');
    });

    it('arreglo vacío y de un solo tiempo: no estima', () => {
      expect(estimateFpsFromTimestamps([]).fps).toBeNull();
      expect(estimateFpsFromTimestamps([1.5]).fps).toBeNull();
    });
  });

  describe('datos inválidos', () => {
    it('NaN e Infinity mezclados se ignoran', () => {
      const times = makeTimes(30, 31);
      times.splice(10, 0, NaN);
      times.splice(20, 0, Infinity, -Infinity);
      const r = estimateFpsFromTimestamps(times);
      expect(r.fps).toBe(30);
      expect(r.diffCount).toBe(30);
    });

    it('un salto hacia atrás (por ejemplo al hacer seek) se ignora', () => {
      const times = [...makeTimes(30, 16), ...makeTimes(30, 31).slice(5)];
      const r = estimateFpsFromTimestamps(times);
      expect(r.fps).toBe(30);
      expect(r.confidence).toBe('high');
    });

    it('una pausa larga en medio se ignora', () => {
      const first = makeTimes(30, 16);
      const second = makeTimes(30, 16).map((t) => t + 10); // salto de ~10 s
      const r = estimateFpsFromTimestamps([...first, ...second]);
      expect(r.fps).toBe(30);
      expect(r.confidence).toBe('high');
    });

    it('un fotograma repetido (intervalo 0) se ignora', () => {
      const times = makeTimes(30, 31);
      times.splice(10, 0, times[9]);
      expect(estimateFpsFromTimestamps(times).fps).toBe(30);
    });
  });

  it('no modifica el arreglo recibido', () => {
    const times = Object.freeze(makeTimes(30, 31));
    expect(() => estimateFpsFromTimestamps(times)).not.toThrow();
    expect(times).toEqual(makeTimes(30, 31));
  });
});
