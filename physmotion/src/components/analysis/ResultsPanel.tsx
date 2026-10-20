import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { useProjectileResults } from '../../hooks/useProjectileResults';
import { xOfTEquation, yOfTEquation } from '../../physics/equations';
import { assessReliability } from '../../physics/reliability';
import type { DataSource, ResultValue } from '../../types/analysis';
import { formatNumber } from '../../utils/format';
import SourceBadge, { SourceLegend } from '../ui/SourceBadge';
import ReliabilityWarnings from './ReliabilityWarnings';
import ProcedureSteps from './ProcedureSteps';

interface Row {
  label: string;
  value?: ResultValue;
  /** Por qué no se pudo calcular (solo si `value` no existe). */
  missing?: string;
}

interface InputRow {
  label: string;
  text: string;
  source: DataSource;
}

/**
 * Resultados del análisis: datos de entrada, variables calculadas (valor, unidad, ecuación y
 * origen del dato), ecuaciones ajustadas y advertencias de fiabilidad.
 * El procedimiento paso a paso (4.4) y las gráficas (4.5 y 4.6) se agregan después.
 */
export default function ResultsPanel() {
  const { results } = useProjectileResults();
  const video = useAnalysisStore((s) => s.video);
  const reference = useAnalysisStore((s) => s.reference);
  const measurements = useAnalysisStore((s) => s.measurements);

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

  const warnings = assessReliability(results, video, measurements);

  const inputs: InputRow[] = [];
  const pointCount = new Set(measurements.filter((m) => m.physical).map((m) => m.time)).size;
  inputs.push({ label: 'Puntos marcados', text: String(pointCount), source: 'measured' });
  if (reference.scale) {
    inputs.push({
      label: 'Distancia real de la escala',
      text: `${formatNumber(reference.scale.realDistanceMeters)} m`,
      source: 'user',
    });
  }
  if (video) {
    inputs.push({
      label: video.captureFps ? 'FPS del video (reproducción)' : 'FPS del video',
      text: `${formatNumber(video.fps)} fps`,
      source: video.fpsSource,
    });
    if (video.captureFps) {
      inputs.push({
        label: 'FPS de grabación (cámara lenta)',
        text: `${formatNumber(video.captureFps)} fps`,
        source: 'user',
      });
    }
  }

  const rows: Row[] = [
    { label: 'Velocidad horizontal inicial (v0x)', value: results.v0x },
    { label: 'Velocidad vertical inicial (v0y)', value: results.v0y },
    { label: 'Velocidad inicial (v0)', value: results.v0 },
    { label: 'Ángulo de lanzamiento', value: results.launchAngleDeg },
    { label: 'Gravedad (g)', value: results.gravity },
    {
      label: 'Tiempo de vuelo',
      value: results.flightTime,
      missing:
        'La parábola ajustada no vuelve a la altura del origen (y = 0) después de t = 0, o no abre hacia abajo.',
    },
    {
      label: 'Altura máxima',
      value: results.maxHeight,
      missing: 'La parábola ajustada no abre hacia abajo (g ≤ 0): revisa los puntos marcados.',
    },
    {
      label: 'Alcance horizontal',
      value: results.range,
      missing: 'Se necesita el tiempo de vuelo.',
    },
  ];

  return (
    <div className="space-y-4 text-sm">
      <h2 className="font-semibold">Resultados</h2>

      <ReliabilityWarnings issues={warnings} />

      <section aria-labelledby="results-inputs" className="space-y-1.5">
        <h3 id="results-inputs" className="font-medium">
          Datos de entrada
        </h3>
        <ul className="space-y-1">
          {inputs.map(({ label, text, source }) => (
            <li key={label} className="flex items-baseline justify-between gap-2">
              <span>{label}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <strong>{text}</strong>
                <SourceBadge source={source} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="results-values" className="space-y-1.5">
        <h3 id="results-values" className="font-medium">
          Variables calculadas
        </h3>
        <ul className="space-y-2">
          {rows.map(({ label, value, missing }) => (
            <li key={label} className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
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
              </div>
              {value?.equation && <p className="text-xs text-ink/60">{value.equation}</p>}
              {!value && missing && <p className="text-xs text-ink/60">{missing}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="results-fit" className="space-y-1">
        <h3 id="results-fit" className="font-medium">
          Ecuaciones ajustadas
        </h3>
        <p className="font-mono text-xs">
          {xOfTEquation(results.fit.xOfT)}{' '}
          <span className="font-sans text-ink/60">
            (R² = {formatNumber(results.fit.xOfT.r2, 4)})
          </span>
        </p>
        <p className="font-mono text-xs">
          {yOfTEquation(results.fit.yOfT)}{' '}
          <span className="font-sans text-ink/60">
            (R² = {formatNumber(results.fit.yOfT.r2, 4)})
          </span>
        </p>
        <p className="text-xs text-ink/60">
          x e y en metros y t en segundos, desde el fotograma t = 0.
        </p>
      </section>

      <ProcedureSteps results={results} />

      <SourceLegend />
    </div>
  );
}
