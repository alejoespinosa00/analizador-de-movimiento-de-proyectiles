import type { FitResult } from '../types/analysis';
import { formatNumber } from '../utils/format';

/** Primer término de una ecuación: el signo menos va pegado al número. */
function first(value: number): string {
  return `${value < 0 ? '−' : ''}${formatNumber(Math.abs(value), 4)}`;
}

/** Términos siguientes: «+ 2.5·t» o «− 4.9·t²». */
function next(value: number, suffix: string): string {
  return `${value < 0 ? '−' : '+'} ${formatNumber(Math.abs(value), 4)}${suffix}`;
}

/** Ecuación ajustada de la posición horizontal, con sus coeficientes: x(t) = n + m·t */
export function xOfTEquation(fit: FitResult['xOfT']): string {
  return `x(t) = ${first(fit.n)} ${next(fit.m, '·t')}`;
}

/** Ecuación ajustada de la posición vertical, con sus coeficientes: y(t) = c + b·t + a·t² */
export function yOfTEquation(fit: FitResult['yOfT']): string {
  return `y(t) = ${first(fit.c)} ${next(fit.b, '·t')} ${next(fit.a, '·t²')}`;
}