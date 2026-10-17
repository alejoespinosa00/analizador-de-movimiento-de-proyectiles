/** Formatea un número con cifras significativas razonables. */
export function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—';
  return Number(value.toPrecision(digits)).toString();
}

export function formatWithUnit(value: number, unit: string, digits = 3): string {
  return `${formatNumber(value, digits)} ${unit}`;
}
