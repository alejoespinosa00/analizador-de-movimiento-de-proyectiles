import { describe, expect, it } from 'vitest';
import type { Measurement } from '../../src/types/analysis';
import { measurementsToCsv } from '../../src/utils/exportCsv';

const HEADER = 'indice,fotograma,tiempo_s,x_px,y_px,x_m,y_m';

const calibrated: Measurement = {
  id: 'a',
  time: 0.5,
  frameIndex: 15,
  pixel: { x: 100.123456, y: 200 },
  physical: { x: 1.5, y: 2.25 },
};

const uncalibrated: Measurement = {
  id: 'b',
  time: 0.55,
  frameIndex: 16,
  pixel: { x: 110, y: 190.5 },
};

const lines = (csv: string) => csv.split('\r\n');

describe('measurementsToCsv', () => {
  it('sin mediciones devuelve solo el encabezado', () => {
    expect(measurementsToCsv([])).toBe(`${HEADER}\r\n`);
  });

  it('escribe una fila con píxeles y metros', () => {
    expect(lines(measurementsToCsv([calibrated]))[1]).toBe('1,15,0.5,100.12,200,1.5,2.25');
  });

  it('sin escala deja vacías las columnas en metros', () => {
    expect(lines(measurementsToCsv([uncalibrated]))[1]).toBe('1,16,0.55,110,190.5,,');
  });

  it('numera las filas en orden y termina con salto de línea', () => {
    const csv = measurementsToCsv([calibrated, uncalibrated, calibrated]);
    const rows = lines(csv);
    expect(rows.length).toBe(5); // encabezado + 3 filas + línea vacía final
    expect(rows[1].startsWith('1,')).toBe(true);
    expect(rows[2].startsWith('2,')).toBe(true);
    expect(rows[3].startsWith('3,')).toBe(true);
    expect(rows[4]).toBe('');
  });

  it('deja vacío un valor no finito', () => {
    const bad: Measurement = { ...calibrated, physical: { x: NaN, y: Infinity } };
    expect(lines(measurementsToCsv([bad]))[1]).toBe('1,15,0.5,100.12,200,,');
  });

  it('conserva los negativos y no escribe -0', () => {
    const m: Measurement = {
      ...calibrated,
      time: -0.1,
      physical: { x: -1.25, y: -0.0000001 },
    };
    expect(lines(measurementsToCsv([m]))[1]).toBe('1,15,-0.1,100.12,200,-1.25,0');
  });

  it('usa el separador indicado', () => {
    const csv = measurementsToCsv([calibrated], ';');
    expect(lines(csv)[0]).toBe(HEADER.replaceAll(',', ';'));
    expect(lines(csv)[1]).toBe('1;15;0.5;100.12;200;1.5;2.25');
  });
});
