import { describe, expect, it } from 'vitest';
import { getEffectiveFps } from '../src/utils/videoTime';

describe('getEffectiveFps', () => {
  it('devuelve fps cuando no hay captureFps', () => {
    expect(getEffectiveFps({ fps: 30 })).toBe(30);
  });

  it('devuelve fps cuando captureFps es undefined', () => {
    expect(getEffectiveFps({ fps: 30, captureFps: undefined })).toBe(30);
  });

  it('devuelve captureFps cuando existe', () => {
    expect(getEffectiveFps({ fps: 30, captureFps: 240 })).toBe(240);
  });
});