import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import type { Measurement, PickMode, PixelPoint, ReferenceSystem } from '../../types/analysis';
import { screenToVideo, videoToScreen } from '../../utils/coordinates';
import { formatNumber } from '../../utils/format';

/**
 * Canvas encima del video: dibuja origen, ejes, escala y puntos, y captura los clics.
 *
 * Regla de oro: los puntos se GUARDAN en píxeles del video original (screenToVideo) y solo
 * se convierten a pantalla al dibujar (videoToScreen). Así no se desplazan al cambiar el
 * tamaño de la ventana.
 *
 * Qué hace cada clic lo decide `pickMode` del store. Con pickMode = null el canvas no
 * recibe clics.
 */

const HINTS: Record<Exclude<PickMode, null>, string> = {
  origin: 'Haz clic en el punto que será el origen (0, 0)',
  scaleA: 'Escala: haz clic en el primer extremo de la distancia conocida',
  scaleB: 'Escala: haz clic en el segundo extremo',
  measure: 'Haz clic sobre el balón en este fotograma. Usa ← → para cambiar de fotograma',
};

const COLORS = {
  x: '#ef4444',
  y: '#22c55e',
  origin: '#ffffff',
  scale: '#facc15',
  point: '#f59e0b',
  current: '#38bdf8',
  line: 'rgba(250, 204, 21, 0.55)',
  outline: 'rgba(0, 0, 0, 0.75)',
};

export default function VideoCanvasOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const video = useAnalysisStore((s) => s.video);
  const reference = useAnalysisStore((s) => s.reference);
  const measurements = useAnalysisStore((s) => s.measurements);
  const currentFrame = useAnalysisStore((s) => s.currentFrame);
  const pickMode = useAnalysisStore((s) => s.pickMode);

  // Tamaño en pantalla del canvas (cambia al redimensionar la ventana o al cargar el video).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      setSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Dibujo: se repite cuando cambia cualquier cosa que se ve.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !video || size.width === 0 || size.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    const toScreen = (p: PixelPoint) =>
      videoToScreen(p, size.width, size.height, video.width, video.height);

    drawScale(ctx, reference, toScreen);
    drawOrigin(ctx, reference, toScreen);
    drawPoints(ctx, measurements, currentFrame, toScreen);
  }, [size, video, reference, measurements, currentFrame]);

  // Esc cancela el modo de selección.
  useEffect(() => {
    if (!pickMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useAnalysisStore.getState().setPickMode(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pickMode]);

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const state = useAnalysisStore.getState(); // valores actuales, no los del último render
    if (!canvas || !state.video || !state.pickMode) return;

    const point = screenToVideo(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect(),
      state.video.width,
      state.video.height,
    );
    if (!point) return;

    switch (state.pickMode) {
      case 'origin':
        state.setReference({ origin: point });
        state.setPickMode(null);
        break;
      case 'scaleA':
        // Hasta marcar B, los dos extremos coinciden (distancia 0 = escala incompleta).
        state.setReference({
          scale: {
            pointA: point,
            pointB: point,
            realDistanceMeters: state.reference.scale?.realDistanceMeters ?? 0,
          },
        });
        state.setPickMode('scaleB');
        break;
      case 'scaleB':
        if (state.reference.scale) {
          state.setReference({ scale: { ...state.reference.scale, pointB: point } });
        }
        state.setPickMode(null);
        break;
      case 'measure':
        state.addMeasurementAt(point); // sigue en modo medir para marcar varios puntos
        break;
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-label="Superposición para marcar puntos sobre el video"
        className={`absolute inset-0 h-full w-full ${
          pickMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
        onClick={handleClick}
      />
      {pickMode && (
        <div
          role="status"
          className="pointer-events-none absolute left-2 top-2 max-w-[90%] rounded bg-ink/85 px-2 py-1 text-xs text-white"
        >
          {HINTS[pickMode]} · Esc para cancelar
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------------------
// Dibujo
// ---------------------------------------------------------------------------------------

type ToScreen = (p: PixelPoint) => PixelPoint;

/** Texto con contorno oscuro para que se lea sobre cualquier fondo. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
) {
  ctx.font = '600 12px system-ui, sans-serif';
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.outline;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawDot(ctx: CanvasRenderingContext2D, p: PixelPoint, radius: number, color: string) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.outline;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: PixelPoint,
  to: PixelPoint,
  color: string,
  label: string,
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const head = 9;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - 0.4), to.y - head * Math.sin(angle - 0.4));
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle + 0.4), to.y - head * Math.sin(angle + 0.4));
  };
  ctx.lineCap = 'round';
  path();
  ctx.lineWidth = 5;
  ctx.strokeStyle = COLORS.outline;
  ctx.stroke();
  path();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  ctx.stroke();
  drawLabel(ctx, label, to.x + 6, to.y - 6, color);
}

/** Origen y ejes: x hacia la derecha e y hacia arriba (girados si axisAngle ≠ 0). */
function drawOrigin(ctx: CanvasRenderingContext2D, ref: ReferenceSystem, toScreen: ToScreen) {
  if (!ref.origin) return;
  const o = toScreen(ref.origin);
  const length = 56;
  const cos = Math.cos(ref.axisAngle);
  const sin = Math.sin(ref.axisAngle);

  drawArrow(ctx, o, { x: o.x + cos * length, y: o.y - sin * length }, COLORS.x, 'x');
  drawArrow(ctx, o, { x: o.x - sin * length, y: o.y - cos * length }, COLORS.y, 'y');
  drawDot(ctx, o, 5, COLORS.origin);
}

/** Segmento de la distancia conocida, con su longitud real si ya se ingresó. */
function drawScale(ctx: CanvasRenderingContext2D, ref: ReferenceSystem, toScreen: ToScreen) {
  if (!ref.scale) return;
  const a = toScreen(ref.scale.pointA);
  const b = toScreen(ref.scale.pointB);
  const hasSegment = a.x !== b.x || a.y !== b.y;

  if (hasSegment) {
    const line = () => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    };
    ctx.setLineDash([8, 6]);
    line();
    ctx.lineWidth = 5;
    ctx.strokeStyle = COLORS.outline;
    ctx.stroke();
    line();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = COLORS.scale;
    ctx.stroke();
    ctx.setLineDash([]);

    const meters = ref.scale.realDistanceMeters;
    const text = meters > 0 ? `${formatNumber(meters, 3)} m` : 'distancia conocida';
    drawLabel(ctx, text, (a.x + b.x) / 2 + 8, (a.y + b.y) / 2 - 8, COLORS.scale);
  }
  drawDot(ctx, a, 4, COLORS.scale);
  if (hasSegment) drawDot(ctx, b, 4, COLORS.scale);
}

/** Puntos medidos: línea que los une, y el del fotograma actual resaltado. */
function drawPoints(
  ctx: CanvasRenderingContext2D,
  measurements: Measurement[],
  currentFrame: number,
  toScreen: ToScreen,
) {
  if (measurements.length === 0) return;
  const points = measurements.map((m) => ({ m, p: toScreen(m.pixel) }));

  if (points.length > 1) {
    ctx.beginPath();
    points.forEach(({ p }, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COLORS.line;
    ctx.stroke();
  }

  points.forEach(({ m, p }, i) => {
    const isCurrent = m.frameIndex === currentFrame;
    drawDot(ctx, p, isCurrent ? 6 : 4, isCurrent ? COLORS.current : COLORS.point);
    drawLabel(ctx, String(i + 1), p.x + 8, p.y - 8, isCurrent ? COLORS.current : COLORS.point);
  });
}