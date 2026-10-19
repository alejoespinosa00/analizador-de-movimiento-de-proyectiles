import { describe, expect, it } from 'vitest';
import { xOfTEquation, yOfTEquation } from '../../src/physics/equations';

describe('ecuaciones ajustadas', () => {
  it('x(t) con pendiente positiva y término independiente positivo', () => {
    expect(xOfTEquation({ m: 3.5, n: 0.2, r2: 1 })).toBe('x(t) = 0.2 + 3.5·t');
  });

  it('x(t) con signos negativos', () => {
    expect(xOfTEquation({ m: -1.25, n: -0.5, r2: 1 })).toBe('x(t) = −0.5 − 1.25·t');
  });

  it('y(t) de un proyectil típico', () => {
    expect(yOfTEquation({ a: -4.9, b: 6.0622, c: 2, r2: 1 })).toBe(
      'y(t) = 2 + 6.062·t − 4.9·t²',
    );
  });

  it('y(t) con coeficiente cuadrático positivo', () => {
    expect(yOfTEquation({ a: 1.5, b: -2, c: 0, r2: 1 })).toBe('y(t) = 0 − 2·t + 1.5·t²');
  });
});