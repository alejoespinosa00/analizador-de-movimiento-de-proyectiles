import { useId, useState } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import SourceBadge from '../ui/SourceBadge';

type Parsed = { value: number } | { error: string };

/** Acepta solo números finitos mayores que 0 (también con coma decimal). */
function parsePositive(text: string): Parsed {
  const t = text.trim().replace(',', '.');
  if (t === '') return { error: 'Escribe un valor.' };
  const n = Number(t);
  if (!Number.isFinite(n)) return { error: 'Debe ser un número.' };
  if (n <= 0) return { error: 'Debe ser mayor que 0.' };
  return { value: n };
}

const inputClass = 'w-28 rounded-md border border-ink/20 px-2 py-1 text-sm';

export default function FpsInput() {
  const video = useAnalysisStore((s) => s.video);
  const updateVideo = useAnalysisStore((s) => s.updateVideo);

  // null = el usuario no está editando; se muestra el valor del store.
  const [fpsDraft, setFpsDraft] = useState<string | null>(null);
  const [captureDraft, setCaptureDraft] = useState<string | null>(null);

  const fpsId = useId();
  const captureId = useId();

  if (!video) return null;

  const fpsText = fpsDraft ?? String(video.fps);
  const captureText = captureDraft ?? (video.captureFps !== undefined ? String(video.captureFps) : '');

  const fpsParsed = parsePositive(fpsText);
  const fpsError = fpsDraft !== null && 'error' in fpsParsed ? fpsParsed.error : '';

  // El campo de cámara lenta es opcional: vacío significa "no usar".
  const captureEmpty = captureText.trim() === '';
  const captureParsed = captureEmpty ? null : parsePositive(captureText);
  const captureError = captureParsed && 'error' in captureParsed ? captureParsed.error : '';

  const handleFps = (text: string) => {
    setFpsDraft(text);
    const parsed = parsePositive(text);
    // Los valores inválidos no se guardan.
    if ('value' in parsed) updateVideo({ fps: parsed.value, fpsSource: 'user' });
  };

  const handleCapture = (text: string) => {
    setCaptureDraft(text);
    if (text.trim() === '') {
      updateVideo({ captureFps: undefined });
      return;
    }
    const parsed = parsePositive(text);
    if ('value' in parsed) updateVideo({ captureFps: parsed.value });
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <label htmlFor={fpsId} className="font-medium">
            FPS del video
          </label>
          <SourceBadge source={video.fpsSource} />
        </div>
        <input
          id={fpsId}
          type="number"
          inputMode="decimal"
          step="any"
          className={inputClass}
          value={fpsText}
          onChange={(e) => handleFps(e.target.value)}
          aria-invalid={fpsError !== ''}
          aria-describedby={fpsError ? `${fpsId}-error` : undefined}
        />
        {fpsError && (
          <p id={`${fpsId}-error`} role="alert" className="text-red-600">
            {fpsError}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor={captureId} className="font-medium">
          FPS reales de grabación (cámara lenta, opcional)
        </label>
        <input
          id={captureId}
          type="number"
          inputMode="decimal"
          step="any"
          className={inputClass}
          value={captureText}
          onChange={(e) => handleCapture(e.target.value)}
          aria-invalid={captureError !== ''}
          aria-describedby={captureError ? `${captureId}-error` : undefined}
        />
        {captureError && (
          <p id={`${captureId}-error`} role="alert" className="text-red-600">
            {captureError}
          </p>
        )}
      </div>

      <p className="text-xs text-ink/60">
        Si grabaste en cámara lenta, el archivo puede decir 240 fps pero reproducirse a 30. En ese caso escribe
        aquí los FPS reales de grabación; se usarán para convertir fotogramas a tiempo. Si no, déjalo vacío.
      </p>
    </div>
  );
}