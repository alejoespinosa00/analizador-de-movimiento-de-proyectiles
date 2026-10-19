import { useMemo } from 'react';
import { fitProjectile } from '../physics/projectile';
import { validateData } from '../physics/validation';
import type { ProjectileResults, ValidationResult } from '../types/analysis';
import { useAnalysisStore } from './useAnalysisStore';

export interface UseProjectileResultsReturn {
  /** null mientras falten datos (ver `validation.issues` para saber cuáles). */
  results: ProjectileResults | null;
  validation: ValidationResult;
}

/**
 * Único punto por donde la interfaz obtiene los cálculos: lee el video, la referencia y los
 * puntos del store, valida y ajusta. Los paneles y gráficas leen de aquí, no de physics/.
 *
 * Se recalcula solo cuando cambian el video, la referencia o los puntos (no al cambiar de
 * fotograma).
 */
export function useProjectileResults(): UseProjectileResultsReturn {
  const video = useAnalysisStore((s) => s.video);
  const reference = useAnalysisStore((s) => s.reference);
  const measurements = useAnalysisStore((s) => s.measurements);

  return useMemo(() => {
    const validation = validateData(video, reference, measurements);
    const results = validation.canCompute.trajectory ? fitProjectile(measurements) : null;
    return { results, validation };
  }, [video, reference, measurements]);
}   