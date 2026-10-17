import type { RefObject } from 'react';

/**
 * Estima los FPS del video midiendo la diferencia de mediaTime entre fotogramas.
 * TODO(sprint-1): implementar. Debe devolver { fps, confidence } y permitir que el usuario lo corrija.
 */
export function useFpsEstimate(_videoRef: RefObject<HTMLVideoElement | null>) {
  return { fps: null as number | null, confidence: 'low' as 'low' | 'medium' | 'high' };
}
