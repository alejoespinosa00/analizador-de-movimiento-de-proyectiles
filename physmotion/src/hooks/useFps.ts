import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { useAnalysisStore } from './useAnalysisStore';
import { useVideoFrame, type FrameInfo } from './useVideoFrame';
import {
  estimateFpsFromTimestamps,
  MEDIUM_DIFFS,
  type FpsConfidence,
  type FpsEstimate,
} from '../utils/fpsEstimate';

/**
 * Sugiere los FPS del video midiendo el tiempo entre fotogramas mientras se reproduce.
 *
 * - Solo SUGIERE: no escribe en el store. El usuario decide si usa el valor.
 * - Solo cuenta fotogramas de 'frame-callback' y con el video reproduciéndose. Los de
 *   'timeupdate' son aproximados, y los que aparecen al avanzar a mano con el video en pausa
 *   no sirven (el paso lo decide el propio FPS que se está estimando).
 * - Mide los FPS de reproducción del archivo, no detecta cámara lenta.
 *
 * LIMITACIÓN: si el video tiene más FPS que la frecuencia de refresco de la pantalla
 * (por ejemplo 120 o 240 fps en un monitor de 60 Hz), el navegador no muestra todos los
 * fotogramas y la estimación puede dar un valor menor al real con confianza alta.
 * Es una limitación del método. Por eso la sugerencia nunca debe aplicarse sola.
 *
 * Llamar desde un componente que solo se monte cuando ya existe el <video>.
 */

const MAX_SAMPLES = 90; // se conservan solo los últimos tiempos
const RECALC_EVERY = 5; // se recalcula (y se re-renderiza) cada 5 fotogramas nuevos

const EMPTY_ESTIMATE: FpsEstimate = {
  fps: null,
  rawFps: null,
  confidence: 'low',
  isVariable: false,
  diffCount: 0,
};

interface Bucket {
  url: string | undefined; // video al que pertenecen las muestras
  times: number[];
  sinceCalc: number;
}

export interface UseFpsEstimateResult {
  fps: number | null;
  rawFps: number | null;
  confidence: FpsConfidence;
  isVariable: boolean;
  diffCount: number;
  /** true mientras falten muestras: hay que reproducir el video unos segundos. */
  needsPlayback: boolean;
  reset: () => void;
}

export function useFpsEstimate(videoRef: RefObject<HTMLVideoElement | null>): UseFpsEstimateResult {
  // Solo se LEE del store, para saber cuándo cambia el video.
  const objectUrl = useAnalysisStore((s) => s.video?.objectUrl);

  // Las muestras van en un ref (no en estado) para no re-renderizar en cada fotograma.
  const bucketRef = useRef<Bucket>({ url: objectUrl, times: [], sinceCalc: 0 });
  const [stored, setStored] = useState<{ url: string | undefined; estimate: FpsEstimate }>({
    url: objectUrl,
    estimate: EMPTY_ESTIMATE,
  });

  // Si cambió el video, el estado guardado es del anterior y se ignora.
  const estimate = stored.url === objectUrl ? stored.estimate : EMPTY_ESTIMATE;

  useVideoFrame(videoRef, (info: FrameInfo) => {
    if (info.source !== 'frame-callback') return;
    const video = videoRef.current;
    if (!video || video.paused || video.seeking) return;

    // Video nuevo: se empieza de cero.
    if (bucketRef.current.url !== objectUrl) {
      bucketRef.current = { url: objectUrl, times: [], sinceCalc: 0 };
    }
    const bucket = bucketRef.current;

    bucket.times.push(info.mediaTime);
    if (bucket.times.length > MAX_SAMPLES) {
      bucket.times.splice(0, bucket.times.length - MAX_SAMPLES);
    }

    bucket.sinceCalc += 1;
    if (bucket.sinceCalc >= RECALC_EVERY) {
      bucket.sinceCalc = 0;
      setStored({ url: objectUrl, estimate: estimateFpsFromTimestamps(bucket.times) });
    }
  });

  const reset = useCallback(() => {
    bucketRef.current = { url: objectUrl, times: [], sinceCalc: 0 };
    setStored({ url: objectUrl, estimate: EMPTY_ESTIMATE });
  }, [objectUrl]);

  return useMemo(
    () => ({ ...estimate, needsPlayback: estimate.diffCount < MEDIUM_DIFFS, reset }),
    [estimate, reset],
  );
}
