import { useProjectileResults } from '../../hooks/useProjectileResults';
import type { ResultKey, ValidationIssue } from '../../types/analysis';

const RESULT_LABELS: Record<ResultKey, string> = {
  position: 'Posición',
  velocity: 'Velocidad inicial',
  acceleration: 'Gravedad (aceleración)',
  trajectory: 'Trayectoria y ecuación',
  flightTime: 'Tiempo de vuelo',
  maxHeight: 'Altura máxima',
  range: 'Alcance horizontal',
};

const SEVERITY: Record<ValidationIssue['severity'], { label: string; className: string }> = {
  error: { label: 'Falta', className: 'border-red-200 bg-red-50 text-red-900' },
  warning: { label: 'Ojo', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  info: { label: 'Nota', className: 'border-sky-200 bg-sky-50 text-sky-900' },
};

/**
 * Qué datos faltan y qué cálculos están habilitados (physics/validation.ts).
 * Se apoya en texto e iconos, no solo en color.
 */
export default function ValidationPanel() {
  const { validation } = useProjectileResults();
  const { issues, canCompute } = validation;

  return (
    <div className="space-y-3 text-sm">
      <h2 className="font-semibold">Validación de datos</h2>

      <div aria-live="polite">
        {issues.length === 0 ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-emerald-900">
            ✓ Datos suficientes para calcular.
          </p>
        ) : (
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li
                key={issue.code}
                className={`rounded-md border px-2 py-1.5 ${SEVERITY[issue.severity].className}`}
              >
                <strong>{SEVERITY[issue.severity].label}:</strong> {issue.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/60">
          Qué se puede calcular
        </h3>
        <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
          {(Object.keys(RESULT_LABELS) as ResultKey[]).map((key) => (
            <li key={key} className={canCompute[key] ? '' : 'text-ink/50'}>
              <span aria-hidden="true">{canCompute[key] ? '✓' : '✗'}</span> {RESULT_LABELS[key]}
              <span className="sr-only">
                {canCompute[key] ? ': disponible' : ': no disponible'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}