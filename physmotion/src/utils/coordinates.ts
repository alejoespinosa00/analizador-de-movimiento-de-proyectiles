import type { PhysicalPoint, PixelPoint, ReferenceSystem } from '../types/analysis';

/** Metros por píxel, o null si aún no hay escala. */
export function metersPerPixel(ref: ReferenceSystem): number | null {
  if (!ref.scale) return null;
  const { pointA, pointB, realDistanceMeters } = ref.scale;
  const px = Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  if (px === 0 || realDistanceMeters <= 0) return null;
  return realDistanceMeters / px;
}

/** Píxel del video → metros en el sistema de referencia (Y hacia arriba). */
export function pixelToPhysical(p: PixelPoint, ref: ReferenceSystem): PhysicalPoint | null {
  const k = metersPerPixel(ref);
  if (k === null || ref.origin === null) return null; 
  const dx = p.x - ref.origin.x;
  const dy = ref.origin.y - p.y; // la Y de la pantalla crece hacia abajo
  const cos = Math.cos(ref.axisAngle);
  const sin = Math.sin(ref.axisAngle);
  return { x: k * (dx * cos + dy * sin), y: k * (-dx * sin + dy * cos) };
}

/**
 * Pantalla (coordenadas del cliente) → píxeles del video original.
 * Considera las barras laterales de object-fit: contain.
 */
export function screenToVideo(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  videoWidth: number,
  videoHeight: number,
): PixelPoint | null {
  const scale = Math.min(rect.width / videoWidth, rect.height / videoHeight);
  const offsetX = (rect.width - videoWidth * scale) / 2;
  const offsetY = (rect.height - videoHeight * scale) / 2;
  const x = (clientX - rect.left - offsetX) / scale;
  const y = (clientY - rect.top - offsetY) / scale;
  if (x < 0 || y < 0 || x > videoWidth || y > videoHeight) return null;
  return { x, y };
}

/** Píxeles del video original → coordenadas del canvas (para dibujar). */
export function videoToScreen(
  p: PixelPoint,
  width: number,
  height: number,
  videoWidth: number,
  videoHeight: number,
): PixelPoint {
  const scale = Math.min(width / videoWidth, height / videoHeight);
  const offsetX = (width - videoWidth * scale) / 2;
  const offsetY = (height - videoHeight * scale) / 2;
  return { x: p.x * scale + offsetX, y: p.y * scale + offsetY };
}
