import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import Button from '../ui/Button';

export default function StartFrameButton() {
  const video = useAnalysisStore((s) => s.video);
  const currentFrame = useAnalysisStore((s) => s.currentFrame);
  const startFrame = useAnalysisStore((s) => s.startFrame);
  const measurements = useAnalysisStore((s) => s.measurements);
  const setStartFrame = useAnalysisStore((s) => s.setStartFrame);

  const hasMeasurements = measurements.length > 0;
  const disabled = !video || hasMeasurements;

  const statusText =
    startFrame === 0 || !video
      ? 't = 0 en el fotograma 0 (inicio del video)'
      : `t = 0 en el fotograma ${startFrame} (≈ ${(startFrame / video.fps).toFixed(2)} s del video)`;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          disabled={disabled}
          onClick={() => setStartFrame(currentFrame)}
        >
          Definir t = 0 aquí
        </Button>
        <Button
          variant="secondary"
          disabled={disabled || startFrame === 0}
          onClick={() => setStartFrame(0)}
        >
          Restablecer a 0
        </Button>
      </div>

      <p aria-live="polite">{statusText}</p>
      <p className="text-ink/70">Pausa el video en el fotograma donde empieza el movimiento.</p>
      {hasMeasurements && <p>Borra los puntos marcados antes de cambiar t = 0.</p>}
    </div>
  );
}