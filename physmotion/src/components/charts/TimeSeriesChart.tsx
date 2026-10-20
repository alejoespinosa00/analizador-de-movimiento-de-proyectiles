import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { useProjectileResults } from '../../hooks/useProjectileResults';
import { SERIES_KEYS, SERIES_META, timeSeriesData } from '../../utils/chartData';
import type { SeriesKey } from '../../utils/chartData';
import { formatNumber } from '../../utils/format';
import SourceBadge from '../ui/SourceBadge';

const FIT_COLOR = '#6d28d9';
const POINT_COLOR = { measured: '#0f766e', estimated: '#a78bfa' };

/** Gráficas en función del tiempo: x(t), y(t), vx(t) y vy(t), a elección. */
export default function TimeSeriesChart() {
  const { results } = useProjectileResults();
  const measurements = useAnalysisStore((s) => s.measurements);
  const [key, setKey] = useState<SeriesKey>('vy');

  const data = useMemo(
    () => (results ? timeSeriesData(key, measurements, results.fit) : null),
    [results, measurements, key],
  );

  if (!data) {
    return (
      <div className="space-y-2 text-sm">
        <h2 className="font-semibold">Variables en función del tiempo</h2>
        <p className="text-ink/70">
          Las gráficas aparecen cuando hay resultados. Revisa el panel de validación para ver qué
          falta.
        </p>
      </div>
    );
  }

  const meta = SERIES_META[key];
  const tickFormatter = (value: number) => formatNumber(value, 3);

  return (
    <div className="space-y-2 text-sm">
      <h2 className="font-semibold">Variables en función del tiempo</h2>

      <div role="group" aria-label="Variable a graficar" className="flex flex-wrap gap-2">
        {SERIES_KEYS.map((k) => {
          const active = k === key;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={active}
              onClick={() => setKey(k)}
              className={`rounded-md border px-3 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-brand-500 ${
                active
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-ink/20 bg-white hover:bg-ink/5'
              }`}
            >
              {SERIES_META[k].label}
            </button>
          );
        })}
      </div>

      <div
        role="img"
        aria-label={`Gráfica de ${meta.label}: ${meta.axisLabel} contra el tiempo en segundos, con ${meta.measuredNote} y ${meta.fittedNote}.`}
        className="h-72 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="t"
              unit=" s"
              domain={['auto', 'auto']}
              tickFormatter={tickFormatter}
              label={{ value: 't (s)', position: 'insideBottom', offset: -12 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={meta.label}
              unit={` ${meta.unit}`}
              domain={['auto', 'auto']}
              tickFormatter={tickFormatter}
              label={{ value: meta.axisLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value) => formatNumber(Number(value), 3)}
            />
            <Legend verticalAlign="top" />
            <Scatter
              name="Ajuste"
              data={data.fitted}
              fill={FIT_COLOR}
              line={{ stroke: FIT_COLOR, strokeWidth: 2 }}
              shape={() => <g />}
              legendType="line"
              tooltipType="none"
              isAnimationActive={false}
            />
            <Scatter
              name={meta.measuredSource === 'measured' ? 'Puntos medidos' : 'Velocidad media'}
              data={data.measured}
              fill={POINT_COLOR[meta.measuredSource]}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
        <SourceBadge source={meta.measuredSource} /> {meta.measuredNote}
        <SourceBadge source="estimated" /> {meta.fittedNote}
      </p>
    </div>
  );
}