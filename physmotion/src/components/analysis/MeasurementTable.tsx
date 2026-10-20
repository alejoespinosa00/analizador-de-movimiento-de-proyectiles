import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { downloadCsv, measurementsToCsv } from '../../utils/exportCsv';
import { formatNumber } from '../../utils/format';
import Button from '../ui/Button';

/**
 * Puntos marcados: fotograma, tiempo, posición en píxeles y en metros.
 * Permite activar el modo de marcado y borrar puntos.
 */
export default function MeasurementTable() {
  const measurements = useAnalysisStore((s) => s.measurements);
  const currentFrame = useAnalysisStore((s) => s.currentFrame);
  const startFrame = useAnalysisStore((s) => s.startFrame);
  const pickMode = useAnalysisStore((s) => s.pickMode);
  const setPickMode = useAnalysisStore((s) => s.setPickMode);
  const removeMeasurement = useAnalysisStore((s) => s.removeMeasurement);
  const clearMeasurements = useAnalysisStore((s) => s.clearMeasurements);

  const marking = pickMode === 'measure';

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">Puntos medidos ({measurements.length})</h2>
        <Button
          variant={marking ? 'primary' : 'secondary'}
          aria-pressed={marking}
          onClick={() => setPickMode(marking ? null : 'measure')}
        >
          {marking ? 'Dejar de marcar' : 'Marcar puntos'}
        </Button>
      </div>

      {measurements.length === 0 ? (
        <p className="text-ink/70">
          Aún no hay puntos. Pulsa «Marcar puntos» y haz clic sobre el balón. El primer punto que
          marques define t = 0, así que empieza en el fotograma donde arranca el movimiento.
        </p>
      ) : (
        <>
          <p className="text-xs text-ink/70">t = 0 en el fotograma {startFrame}</p>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-right text-xs tabular-nums">
              <thead className="sticky top-0 bg-white text-ink/70">
                <tr>
                  <th className="px-1 py-1 text-left font-medium">#</th>
                  <th className="px-1 py-1 font-medium">Fotog.</th>
                  <th className="px-1 py-1 font-medium">t (s)</th>
                  <th className="px-1 py-1 font-medium">x (px)</th>
                  <th className="px-1 py-1 font-medium">y (px)</th>
                  <th className="px-1 py-1 font-medium">x (m)</th>
                  <th className="px-1 py-1 font-medium">y (m)</th>
                  <th className="px-1 py-1">
                    <span className="sr-only">Borrar</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, i) => (
                  <tr
                    key={m.id}
                    className={m.frameIndex === currentFrame ? 'bg-brand-500/10' : undefined}
                  >
                    <td className="px-1 py-1 text-left">{i + 1}</td>
                    <td className="px-1 py-1">{m.frameIndex}</td>
                    <td className="px-1 py-1">{m.time.toFixed(3)}</td>
                    <td className="px-1 py-1">{m.pixel.x.toFixed(1)}</td>
                    <td className="px-1 py-1">{m.pixel.y.toFixed(1)}</td>
                    <td className="px-1 py-1">
                      {m.physical ? formatNumber(m.physical.x, 4) : '—'}
                    </td>
                    <td className="px-1 py-1">
                      {m.physical ? formatNumber(m.physical.y, 4) : '—'}
                    </td>
                    <td className="px-1 py-1">
                      <button
                        type="button"
                        onClick={() => removeMeasurement(m.id)}
                        aria-label={`Borrar punto ${i + 1}`}
                        className="rounded px-1.5 text-ink/60 hover:bg-ink/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={clearMeasurements}>
              Borrar todos
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadCsv(measurementsToCsv(measurements))}
            >
              Descargar CSV
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
