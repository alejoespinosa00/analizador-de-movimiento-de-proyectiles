/**
 * Selector de archivo de video.
 * TODO(sprint-1): input type="file" accept="video/*", crear URL con URL.createObjectURL,
 * leer metadatos (videoWidth, videoHeight, duration), guardar en useAnalysisStore.setVideo,
 * y avisar que se recomienda MP4 con H.264 (los .mov HEVC pueden no reproducirse).
 */
export default function VideoUploader() {
  return (
    <div className="rounded-lg border-2 border-dashed border-ink/20 p-8 text-center text-sm">
      Aquí se cargará el video (pendiente: sprint 1)
    </div>
  );
}
