import { useEffect, type RefObject } from 'react';

export interface FrameInfo {
  /** Tiempo exacto del fotograma mostrado (segundos). */
  mediaTime: number;
  /** Número de fotogramas presentados (útil para estimar FPS). */
  presentedFrames: number;
}

/**
 * Encapsula video.requestVideoFrameCallback para recibir el tiempo real de cada fotograma.
 * TODO(sprint-1): implementar con fallback a 'timeupdate' si el navegador no lo soporta.
 */
export function useVideoFrame(
  _videoRef: RefObject<HTMLVideoElement | null>,
  _onFrame: (info: FrameInfo) => void,
): void {
  useEffect(() => {
    // TODO(sprint-1)
  }, []);
}
