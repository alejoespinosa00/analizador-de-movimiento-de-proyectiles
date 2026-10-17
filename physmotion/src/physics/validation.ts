import type { Measurement, ReferenceSystem, ValidationResult, VideoInfo } from '../types/analysis';

/**
 * Revisa qué datos hay y qué cálculos son posibles.
 * Reglas mínimas sugeridas:
 *  - Sin escala → no hay cálculos en metros.
 *  - Menos de 3 puntos → no se puede ajustar una parábola (error).
 *  - Menos de 6 puntos → advertir que el resultado es poco fiable.
 *  - FPS no confirmado por el usuario → advertir.
 */
export function validateData(
  _video: VideoInfo | null,
  _ref: ReferenceSystem,
  _measurements: Measurement[],
): ValidationResult {
  // TODO(sprint-2): implementar reglas. Por ahora todo queda bloqueado.
  return {
    canCompute: {
      position: false,
      velocity: false,
      acceleration: false,
      trajectory: false,
      flightTime: false,
      maxHeight: false,
      range: false,
    },
    issues: [],
  };
}
