import { useRef, useState } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import Button from '../ui/Button';

/** FPS provisional: la estimación real se hará en useFps (otra tarea). El usuario podrá corregirlo. */
const DEFAULT_FPS = 30;

/** Lee los metadatos del video sin subirlo a ningún servidor. */
function readMetadata(file: File): Promise<{
  objectUrl: string;
  width: number;
  height: number;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.muted = true;

    el.onloadedmetadata = () => {
      resolve({
        objectUrl,
        width: el.videoWidth,
        height: el.videoHeight,
        duration: el.duration,
      });
    };
    el.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer el video. Prueba con un MP4 (H.264).'));
    };
    el.src = objectUrl;
  });
}

export default function VideoUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setVideo = useAnalysisStore((s) => s.setVideo);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (file?: File) => {
    setError('');
    setWarning('');
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('El archivo seleccionado no es un video.');
      return;
    }

    const isMp4 = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
    if (!isMp4) {
      setWarning(
        'Se recomienda MP4 con H.264. Otros formatos (por ejemplo .mov con HEVC) pueden no reproducirse.',
      );
    }

    try {
      setLoading(true);
      const meta = await readMetadata(file);

      if (!meta.width || !meta.height || !Number.isFinite(meta.duration)) {
        URL.revokeObjectURL(meta.objectUrl);
        setError('El video no tiene metadatos válidos. Prueba con un MP4 (H.264).');
        return;
      }

      setVideo({
        fileName: file.name,
        objectUrl: meta.objectUrl,
        width: meta.width,
        height: meta.height,
        duration: meta.duration,
        fps: DEFAULT_FPS,
        fpsSource: 'estimated',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido al leer el video.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      className="rounded-lg border-2 border-dashed border-ink/20 p-8 text-center text-sm"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handleFile(e.dataTransfer.files[0]);
      }}
    >
      <p className="mb-4">
        {loading ? 'Procesando video...' : 'Arrastra un video aquí o selecciónalo desde tu equipo'}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <Button type="button" disabled={loading} onClick={() => inputRef.current?.click()}>
        Elegir video
      </Button>

      <p className="mt-4 text-xs text-ink/60">
        Recomendado: MP4 con H.264. El video se procesa en tu navegador y no se sube a ningún servidor.
      </p>

      {warning && <p className="mt-3 text-amber-700">{warning}</p>}
      {error && (
        <p role="alert" className="mt-3 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}