import type { DataSource } from '../../types/analysis';

const label: Record<DataSource, string> = {
  measured: 'Medido',
  user: 'Ingresado',
  estimated: 'Estimado',
};
const color: Record<DataSource, string> = {
  measured: 'bg-measured/10 text-measured',
  user: 'bg-user/10 text-user',
  estimated: 'bg-estimated/10 text-estimated',
};
const description: Record<DataSource, string> = {
  measured: 'Tomado del video: posiciones y tiempos de los puntos que marcaste.',
  user: 'Lo escribiste tú: distancia de la escala o FPS confirmados.',
  estimated: 'Calculado por el sistema a partir de un ajuste de los puntos medidos.',
};

/** Distingue medido / ingresado / estimado (requisito del README, sección 5). */
export default function SourceBadge({ source }: { source: DataSource }) {
  return (
    <span
      title={description[source]}
      className={`rounded px-1.5 py-0.5 text-xs ${color[source]}`}
    >
      {label[source]}
    </span>
  );
}

/** Explica qué significa cada insignia. Se muestra una vez, junto a los resultados. */
export function SourceLegend() {
  const sources: DataSource[] = ['measured', 'user', 'estimated'];
  return (
    <ul className="space-y-1 text-xs text-ink/60">
      {sources.map((s) => (
        <li key={s} className="flex items-baseline gap-2">
          <SourceBadge source={s} />
          <span>{description[s]}</span>
        </li>
      ))}
    </ul>
  );
}
