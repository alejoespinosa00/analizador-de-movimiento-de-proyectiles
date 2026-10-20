import { useMemo } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { segmentMotions, totalDisplacement } from '../../physics/measurements';
import { formatNumber } from '../../utils/format';
import SourceBadge from '../ui/SourceBadge';

/** Desplazamiento y velocidad media entre puntos consecutivos (desplegable). */
export default function SegmentsTable() {
  const measurements = useAnalysisStore((s) => s.measurements);
  const segments = useMemo(() => segmentMotions(measurements), [measurements]);
  const total = useMemo(() => totalDisplacement(measurements), [measurements]);

  if (segments.length === 0) return null;

  const f = (value: number) => formatNumber(value, 3);

  return (
    <details className="rounded-md border border-ink/10 p-3">
      <summary className="cursor-pointer font-medium">
        Desplazamiento y velocidad media entre puntos
      </summary>

      <div className="mt-2 space-y-2">
        {total && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Desplazamiento del primer al último punto: <strong>{f(total.magnitude)} m</strong>{' '}
              (Δx = {f(total.dx)} m, Δy = {f(total.dy)} m)
            </span>
            <SourceBadge source="measured" />
          </p>
        )}

        <div className="max-h-60 overflow-auto">
          <table className="w-full text-right text-xs tabular-nums">
            <caption className="sr-only">
              Desplazamiento y velocidad media entre cada par de puntos consecutivos
            </caption>
            <thead className="sticky top-0 bg-white text-ink/70">
              <tr>
                <th scope="col" className="px-1 py-1 text-left font-medium">
                  Fotog.
                </th>
                <th scope="col" className="px-1 py-1 font-medium">
                  Δt (s)
                </th>
                <th scope="col" className="px-1 py-1 font-medium">
                  Δx (m)
                </th>
                <th scope="col" className="px-1 py-1 font-medium">
                  Δy (m)
                </th>
                <th scope="col" className="px-1 py-1 font-medium">
                  Δr (m)
                </th>
                <th scope="col" className="px-1 py-1 font-medium">
                  vx (m/s)
                </th>
                <th scope="col" className="px-1 py-1 font-medium">
                  vy (m/s)
                </th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={`${s.fromFrame}-${s.toFrame}`}>
                  <td className="px-1 py-1 text-left">
                    {s.fromFrame}→{s.toFrame}
                  </td>
                  <td className="px-1 py-1">{f(s.dt)}</td>
                  <td className="px-1 py-1">{f(s.dx)}</td>
                  <td className="px-1 py-1">{f(s.dy)}</td>
                  <td className="px-1 py-1">{f(s.magnitude)}</td>
                  <td className="px-1 py-1">{f(s.vx)}</td>
                  <td className="px-1 py-1">{f(s.vy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
          <SourceBadge source="measured" /> desplazamiento (Δ = posición final − inicial)
          <SourceBadge source="estimated" /> velocidad media = Δposición / Δt
        </p>
        <p className="text-xs text-ink/60">
          Δr es la distancia en línea recta entre los dos puntos. Cuanto más juntos estén los
          puntos, más afecta un pequeño error de clic a la velocidad media.
        </p>
      </div>
    </details>
  );
}