/**
 * <video> + canvas superpuesto. Usa useVideoFrame para sincronizar el fotograma actual.
 * TODO(sprint-1): reproducir/pausar, mostrar fotograma actual, exponer videoRef.
 */

import { useState, type ReactNode, type RefObject } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import Button from '../ui/Button';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  children?: ReactNode; // aquí irá el VideoCanvasOverlay más adelante
}

export default function VideoPlayer({ videoRef, children }: VideoPlayerProps) {
  const objectUrl = useAnalysisStore((state) => state.video?.objectUrl);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch (error) {
        console.error('No se pudo reproducir el video:', error);
      }
    } else {
      video.pause();
    }
  };

  if (!objectUrl) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <video
          ref={videoRef}
          src={objectUrl}
          className="block h-auto max-w-full object-contain"
          playsInline
          muted
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        />
        {children}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Button onClick={togglePlay}>
          {isPlaying ? 'Pausar' : 'Reproducir'}
        </Button>
        <span>{isPlaying ? 'Reproduciendo' : 'Pausado'}</span>
        <span>
          {currentTime.toFixed(2)} s / {duration.toFixed(2)} s
        </span>
      </div>
    </div>
  );
}