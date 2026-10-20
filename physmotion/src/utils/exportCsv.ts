import type { Measurement } from '../types/analysis';

const HEADER = ['indice', 'fotograma', 'tiempo_s', 'x_px', 'y_px', 'x_m', 'y_m'];

/** Redondea y escribe el número con punto decimal; vacío si no es finito (p. ej. sin escala). */
function num(value: number | undefined, digits: number): string {
  if (value === undefined || !Number.isFinite(value)) return '';
  return String(Number(value.toFixed(digits)));
}

/**
 * Convierte las mediciones a CSV: una fila por punto, en el mismo orden de la tabla.
 * Columnas: índice, fotograma, tiempo (s), x e y en píxeles del video original, x e y en metros.
 * Las columnas en metros quedan vacías si el punto no tiene escala. Función pura.
 *
 * @param separator coma por defecto; usa ';' si tu Excel está en español.
 */
export function measurementsToCsv(measurements: Measurement[], separator: string = ','): string {
  const rows = measurements.map((m, i) =>
    [
      String(i + 1),
      String(m.frameIndex),
      num(m.time, 6),
      num(m.pixel.x, 2),
      num(m.pixel.y, 2),
      num(m.physical?.x, 6),
      num(m.physical?.y, 6),
    ].join(separator),
  );
  return [HEADER.join(separator), ...rows].join('\r\n') + '\r\n';
}

/** Descarga un texto como archivo CSV desde el navegador. */
export function downloadCsv(content: string, fileName: string = 'physmotion-mediciones.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
