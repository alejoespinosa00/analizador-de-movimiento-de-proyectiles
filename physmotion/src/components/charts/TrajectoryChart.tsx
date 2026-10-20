import { useMemo } from 'react';
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
import { trajectoryChartData } from '../../utils/chartData';
import { formatNumber } from '../../utils/format';
import SourceBadge from '../ui/SourceBadge';

const MEASURED_COLOR = '#0f766e';
const FIT_COLOR = '#6d28d9';

/** y vs x en metros: puntos medidos y parábola ajustada. */
export default function TrajectoryChart() {
  const { results } = useProjectileResults();
  const measurements = useAnalysisStore((s) => s.measurements);

  const data = useMemo(
    () => (results ? trajectoryChartData(measurements, results.fit) : null),
    [results, measurements],
  );

  if (!data) {
    return (
      <div className="space-y-2 text-sm">
        <h2 className="font-semibold">Trayectoria</h2>
        <p className="text-ink/70">
          La gráfica aparece cuando hay resultados. Revisa el panel de validación para ver qué
          falta.
        </p>
      </div>
    );
  }

  const tickFormatter = (value: number) => formatNumber(value, 3);

  return (
    <div className="space-y-2 text-sm">
      <h2 className="font-semibold">Trayectoria</h2>
      <div
        role="img"
        aria-label="Gráfica de la trayectoria: altura y contra posición horizontal x, ambas en metros, con los puntos medidos y la parábola ajustada."
        className="h-72 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="x"
              unit=" m"
              domain={['auto', 'auto']}
              tickFormatter={tickFormatter}
              label={{ value: 'x (m)', position: 'insideBottom', offset: -12 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="y"
              unit=" m"
              domain={['auto', 'auto']}
              tickFormatter={tickFormatter}
              label={{ value: 'y (m)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value) => formatNumber(Number(value), 3)}
            />
            <Legend verticalAlign="top" />
            <Scatter
              name="Parábola ajustada"
              data={data.curve}
              fill={FIT_COLOR}
              line={{ stroke: FIT_COLOR, strokeWidth: 2 }}
              shape={() => <g />}
              legendType="line"
              tooltipType="none"
              isAnimationActive={false}
            />
            <Scatter
              name="Puntos medidos"
              data={data.measured}
              fill={MEASURED_COLOR}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
        <SourceBadge source="measured" /> puntos que marcaste
        <SourceBadge source="estimated" /> curva ajustada
      </p>
    </div>
  );
}
