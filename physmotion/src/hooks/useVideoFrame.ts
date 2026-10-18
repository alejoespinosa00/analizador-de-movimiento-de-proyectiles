import { useEffect, useRef, type RefObject } from 'react';

export interface FrameInfo {
  /** Tiempo del fotograma mostrado, en segundos. */
  mediaTime: number;
  /** Fotogramas presentados hasta ahora. Solo es real con 'frame-callback'; en 'timeupdate' vale 0. */
  presentedFrames: number;
  /**
   * 'frame-callback': tiempo exacto de cada fotograma (requestVideoFrameCallback).
   * 'timeupdate': alternativa aproximada para navegadores sin soporte. Ver nota abajo.
   */
  source: 'frame-callback' | 'timeupdate';
}

/**
 * Avisa cada vez que el <video> presenta un nuevo fotograma, tanto al reproducir como al
 * avanzar o saltar con el video en pausa.
 *
 * Principal: requestVideoFrameCallback, que entrega el mediaTime exacto del fotograma.
 * Se ejecuta una sola vez por fotograma, así que hay que volver a registrarlo en cada llamada.
 *
 * Alternativa (sin soporte): eventos 'timeupdate' y 'seeked' con video.currentTime.
 * 'timeupdate' se dispara solo unas 4 veces por segundo, por eso NO sirve para estimar FPS
 * ni para tiempos precisos. Quien consuma el hook debe revisar `source`.
 *
 * Usar este hook en un componente que se monte solo cuando ya existe el <video>
 * (por ejemplo VideoPlayer o FrameControls). Si el ref está vacío cuando corre el efecto,
 * no se registra nada.
 */
export function useVideoFrame(
  videoRef: RefObject<HTMLVideoElement | null>,
  onFrame: (info: FrameInfo) => void,
): void {
  // Guardamos la última función recibida: así, si cambia en cada render,
  // no hace falta cancelar y volver a registrar el callback del video.
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (typeof video.requestVideoFrameCallback === 'function') {
      let active = true;
      let handle = 0;

      const handleFrame: VideoFrameRequestCallback = (_now, metadata) => {
        if (!active) return;
        onFrameRef.current({
          mediaTime: metadata.mediaTime,
          presentedFrames: metadata.presentedFrames,
          source: 'frame-callback',
        });
        handle = video.requestVideoFrameCallback(handleFrame); // se debe volver a pedir
      };

      handle = video.requestVideoFrameCallback(handleFrame);

      return () => {
        active = false;
        video.cancelVideoFrameCallback(handle);
      };
    }

    // Alternativa aproximada.
    const report = () => {
      onFrameRef.current({
        mediaTime: video.currentTime,
        presentedFrames: 0,
        source: 'timeupdate',
      });
    };
    video.addEventListener('timeupdate', report);
    video.addEventListener('seeked', report);

    return () => {
      video.removeEventListener('timeupdate', report);
      video.removeEventListener('seeked', report);
    };
  }, [videoRef]);
}
