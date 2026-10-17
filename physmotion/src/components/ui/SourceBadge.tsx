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

/** Distingue medido / ingresado / estimado (requisito del README, sección 5). */
export default function SourceBadge({ source }: { source: DataSource }) {
  return <span className={`rounded px-1.5 py-0.5 text-xs ${color[source]}`}>{label[source]}</span>;
}
