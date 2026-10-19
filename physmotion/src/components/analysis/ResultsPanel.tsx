import { useProjectileResults } from '../../hooks/useProjectileResults';
import type { ResultValue } from '../../types/analysis';
import { formatNumber } from '../../utils/format';
import SourceBadge from '../ui/SourceBadge';

/**
 * Versión básica: valor, unidad y origen del dato.
 * La 4.1 la completa (ecuaciones, procedimiento y advertencias de fiabilidad).
 */
export default function ResultsPanel() {
  const { results } = useProjectileResults();

  if (!results) {
    return (
      <div className="space-y-2 text-sm">
        <h2 className="font-semibold">Resultados</h2>
        <p className="text-ink/70">
          Todavía no hay resultados. Revisa el panel de validación para ver qué falta.
        </p>
      </div>
    );
  }

  const rows: { label: string; value?: ResultValue }[] = [
    { label: 'Velocidad horizontal inicial (v0x)', value: results.v0x },
    { label: 'Velocidad vertical inicial (v0y)', value: results.v0y },
    { label: 'Velocidad inicial (v0)', value: results.v0 },
    { label: 'Ángulo de lanzamiento', value: results.launchAngleDeg },
    { label: 'Gravedad (g)', value: results.gravity },
    { label: 'Tiempo de vuelo', value: results.flightTime },
    { label: 'Altura máxima', value: results.maxHeight },
    { label: 'Alcance horizontal', value: results.range },
  ];

  return (
    <div className="space-y-3 text-sm">
      <h2 className="font-semibold">Resultados</h2>
      <ul className="space-y-1.5">
        {rows.map(({ label, value }) => (
          <li key={label} className="flex items-baseline justify-between gap-2">
            <span>{label}</span>
            {value ? (
              <span className="flex items-center gap-2 tabular-nums">
                <strong>
                  {formatNumber(value.value, 3)} {value.unit}
                </strong>
                <SourceBadge source={value.source} />
              </span>
            ) : (
              <span className="text-ink/50">no calculable</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink/60">
        Ajuste de la trayectoria: R² de y(t) = {formatNumber(results.fit.yOfT.r2, 4)}, R² de x(t) ={' '}
        {formatNumber(results.fit.xOfT.r2, 4)}.
      </p>
    </div>
  );
}