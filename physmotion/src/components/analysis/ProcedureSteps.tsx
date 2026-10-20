import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { buildProcedure } from '../../physics/procedure';
import type { ProjectileResults } from '../../types/analysis';

/** Procedimiento paso a paso con los números reales del análisis (desplegable). */
export default function ProcedureSteps({ results }: { results: ProjectileResults }) {
  const video = useAnalysisStore((s) => s.video);
  const reference = useAnalysisStore((s) => s.reference);
  const measurements = useAnalysisStore((s) => s.measurements);

  const steps = buildProcedure({ video, reference, measurements, results });

  return (
    <details className="rounded-md border border-ink/10 p-3">
      <summary className="cursor-pointer font-medium">Procedimiento paso a paso</summary>
      <ol className="mt-2 list-decimal space-y-2 pl-5">
        {steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}.</strong> <span className="text-ink/80">{step.text}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
