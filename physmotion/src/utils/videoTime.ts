import type { VideoInfo } from '../types/analysis';

/**
 * FPS que se usan para convertir fotogramas a tiempo real:
 * los de grabación (cámara lenta) si existen; si no, los de reproducción.
 */
export function getEffectiveFps(video: Pick<VideoInfo, 'fps' | 'captureFps'>): number {
  return video.captureFps ?? video.fps;
}