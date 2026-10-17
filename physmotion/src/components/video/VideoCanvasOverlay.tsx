/**
 * Canvas sobre el video: dibuja ejes, origen, escala y puntos medidos, y captura clics.
 * Usar utils/coordinates (screenToVideo / videoToScreen). Guardar SIEMPRE en píxeles del video original.
 * TODO(sprint-2)
 */
export default function VideoCanvasOverlay() {
  return <canvas className="pointer-events-none absolute inset-0 h-full w-full" />;
}
