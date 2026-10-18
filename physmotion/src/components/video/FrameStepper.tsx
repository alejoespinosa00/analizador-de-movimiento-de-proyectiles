import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { useVideoFrame, type FrameInfo } from '../../hooks/useVideoFrame';
import Button from '../ui/Button';

interface FrameStepperProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export default function FrameStepper({ videoRef }: FrameStepperProps) {
  const fps = useAnalysisStore((s) => s.video?.fps);
  const duration = useAnalysisStore((s) => s.video?.duration);
  const currentFrame = useAnalysisStore((s) => s.currentFrame);
  const setCurrentFrame = useAnalysisStore((s) => s.setCurrentFrame);

  const [time, setTime] = useState(0);

  const lastFrame = fps && duration ? Math.max(0, Math.round(duration * fps) - 1) : 0;

  // Fotograma real que informa useVideoFrame
  useVideoFrame(videoRef, (info: FrameInfo) => {
    if (!fps) return;
    setTime(info.mediaTime);
    // el 1e-6 evita que un error de redondeo baje un fotograma
    setCurrentFrame(Math.min(Math.floor(info.mediaTime * fps + 1e-6), lastFrame));
  });

  const step = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video || !fps) return;

      video.pause();
      const current = Math.floor(video.currentTime * fps + 1e-6);
      const target = Math.min(Math.max(current + delta, 0), lastFrame);
      video.currentTime = (target + 0.5) / fps; // centro del fotograma
    },
    [videoRef, fps, lastFrame],
  );

  // Teclas ← y → para ±1 (se ignoran si escribes en un campo)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button variant="secondary" onClick={() => step(-10)}>−10</Button>
      <Button variant="secondary" onClick={() => step(-1)}>−1</Button>
      <Button variant="secondary" onClick={() => step(1)}>+1</Button>
      <Button variant="secondary" onClick={() => step(10)}>+10</Button>
      <span>Fotograma {currentFrame}</span>
      <span>{time.toFixed(3)} s</span>
    </div>
  );
}