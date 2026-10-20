import type {
  DataSource,
  Measurement,
  ProjectileResults,
  ReferenceSystem,
  VideoInfo,
} from '../types/analysis';
import { metersPerPixel } from '../utils/coordinates';
import { formatNumber } from '../utils/format';
import { xOfTEquation, yOfTEquation } from './equations';

export interface ProcedureStep {
  title: string;
  text: string;
}

export interface ProcedureInput {
  video: VideoInfo | null;
  reference: ReferenceSystem;
  measurements: Measurement[];
  results: ProjectileResults;
}

const FPS_SOURCE_TEXT: Record<DataSource, string> = {
  measured: 'medidos',
  user: 'ingresados por ti',
  estimated: 'estimados',
};

const fmt = (value: number, digits = 3) => formatNumber(value, digits);

/**
 * Explica, con los números reales del análisis, cómo se llegó a cada resultado.
 * Función pura: no lee el store. Solo describe lo que ya calculó fitProjectile.
 */
export function buildProcedure({
  video,
  reference,
  measurements,
  results,
}: ProcedureInput): ProcedureStep[] {
  const steps: ProcedureStep[] = [];
  const points = measurements
    .filter((m) => m.physical !== undefined)
    .sort((a, b) => a.frameIndex - b.frameIndex);
  const first = points[0];
  const last = points[points.length - 1];
  const { fit } = results;

  // 1. Escala
  const scale = reference.scale;
  const k = metersPerPixel(reference);
  if (scale && k !== null) {
    const distPx = Math.hypot(scale.pointB.x - scale.pointA.x, scale.pointB.y - scale.pointA.y);
    steps.push({
      title: 'Escala',
      text: `Marcaste una distancia real de ${fmt(scale.realDistanceMeters)} m que mide ${fmt(distPx, 4)} px en el video. La escala es real / píxeles = ${fmt(k, 4)} m/px.`,
    });
  }

  // 2. Tiempo de cada punto. Los FPS se deducen de los propios puntos para describir
  // exactamente los que se usaron (también con cámara lenta).
  let fps = video ? video.fps : NaN;
  if (first && last && last.time - first.time > 1e-9) {
    fps = (last.frameIndex - first.frameIndex) / (last.time - first.time);
  }
  const fpsOrigin = video ? ` (${FPS_SOURCE_TEXT[video.fpsSource]})` : '';
  steps.push({
    title: 'Tiempo de cada punto',
    text:
      `El tiempo es t = (fotograma − fotograma de t = 0) / FPS, con ${fmt(fps)} FPS${fpsOrigin}.` +
      (first
        ? ` Por ejemplo, el fotograma ${first.frameIndex} corresponde a t = ${fmt(first.time)} s.`
        : ''),
  });

  // 3. Posiciones en metros
  if (reference.origin && first?.physical) {
    const deg = (reference.axisAngle * 180) / Math.PI;
    steps.push({
      title: 'Posiciones en metros',
      text: `Se tomó el píxel (${fmt(reference.origin.x, 4)}, ${fmt(reference.origin.y, 4)}) como origen y el eje x inclinado ${fmt(deg)}° (y positivo hacia arriba). Cada punto se resta del origen, se gira según ese ángulo y se multiplica por la escala. Por ejemplo, el píxel (${fmt(first.pixel.x, 4)}, ${fmt(first.pixel.y, 4)}) pasa a (${fmt(first.physical.x)} m, ${fmt(first.physical.y)} m).`,
    });
  }

  // 4. Ajuste horizontal
  steps.push({
    title: 'Ajuste de x(t)',
    text: `Sin fuerzas horizontales, x(t) es una recta. Se ajustó a ${points.length} puntos: ${xOfTEquation(fit.xOfT)}, con R² = ${fmt(fit.xOfT.r2, 4)}. Su pendiente es la velocidad horizontal.`,
  });

  // 5. Ajuste vertical
  steps.push({
    title: 'Ajuste de y(t)',
    text: `Con aceleración constante, y(t) es una parábola. Se ajustó a los mismos puntos: ${yOfTEquation(fit.yOfT)}, con R² = ${fmt(fit.yOfT.r2, 4)}.`,
  });

  // 6. Velocidades iniciales
  steps.push({
    title: 'Velocidades iniciales',
    text: `v0x es la pendiente de x(t): v0x = ${fmt(results.v0x.value)} ${results.v0x.unit}. v0y es el coeficiente de t en y(t): v0y = ${fmt(results.v0y.value)} ${results.v0y.unit}. Luego v0 = √(v0x² + v0y²) = ${fmt(results.v0.value)} ${results.v0.unit} y θ = atan(v0y / |v0x|) = ${fmt(results.launchAngleDeg.value)}${results.launchAngleDeg.unit}.`,
  });

  // 7. Gravedad
  steps.push({
    title: 'Gravedad',
    text: `La aceleración vertical es 2·a, con a el coeficiente de t² de y(t). Como g es su opuesto: g = −2·(${fmt(fit.yOfT.a, 4)}) = ${fmt(results.gravity.value)} ${results.gravity.unit}.`,
  });

  // 8. Tiempo de vuelo, altura máxima y alcance
  const parts: string[] = [];
  if (results.flightTime) {
    parts.push(
      `Tiempo de vuelo: raíz mayor de a·t² + b·t + c = 0, es decir ${fmt(results.flightTime.value)} ${results.flightTime.unit}.`,
    );
  }
  if (results.maxHeight) {
    parts.push(
      `Altura máxima: y_máx = c − b² / (4a) = ${fmt(results.maxHeight.value)} ${results.maxHeight.unit}.`,
    );
  }
  if (results.range) {
    parts.push(`Alcance: |v0x| · t_vuelo = ${fmt(results.range.value)} ${results.range.unit}.`);
  }
  if (!results.flightTime) {
    parts.push(
      'El tiempo de vuelo y el alcance no se calcularon: la parábola no vuelve a la altura del origen (y = 0) después de t = 0.',
    );
  }
  steps.push({ title: 'Tiempo de vuelo, altura máxima y alcance', text: parts.join(' ') });

  return steps;
}
