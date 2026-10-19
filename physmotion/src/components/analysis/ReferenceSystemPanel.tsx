import { useState } from 'react';
import { useAnalysisStore } from '../../hooks/useAnalysisStore';
import { metersPerPixel } from '../../utils/coordinates';
import { formatNumber } from '../../utils/format';
import Button from '../ui/Button';

/**
 * Define el sistema de referencia: origen (0, 0) y escala (una distancia real conocida
 * para convertir píxeles en metros). Los clics los recibe VideoCanvasOverlay según pickMode.
 */
export default function ReferenceSystemPanel() {
  const reference = useAnalysisStore((s) => s.reference);
  const pickMode = useAnalysisStore((s) => s.pickMode);
  const setReference = useAnalysisStore((s) => s.setReference);
  const setPickMode = useAnalysisStore((s) => s.setPickMode);

  const [distanceText, setDistanceText] = useState(() =>
    reference.scale && reference.scale.realDistanceMeters > 0
      ? String(reference.scale.realDistanceMeters)
      : '',
  );

  const { origin, scale } = reference;
  const pixelLength = scale
    ? Math.hypot(scale.pointB.x - scale.pointA.x, scale.pointB.y - scale.pointA.y)
    : 0;
  const hasTwoPoints = pixelLength > 0;
  const k = metersPerPixel(reference);
  const pickingScale = pickMode === 'scaleA' || pickMode === 'scaleB';

  const handleDistance = (text: string) => {
    setDistanceText(text);
    if (!scale) return;
    const value = Number(text.replace(',', '.'));
    setReference({
      scale: { ...scale, realDistanceMeters: Number.isFinite(value) && value > 0 ? value : 0 },
    });
  };

  const resetReference = () => {
    setPickMode(null);
    setReference({ origin: null, scale: null });
    setDistanceText('');
  };

  return (
    <div className="space-y-4 text-sm">
      <h2 className="font-semibold">Sistema de referencia</h2>

      <section className="space-y-2">
        <p>
          <span aria-hidden="true">{origin ? '✓' : '○'}</span> <strong>Origen:</strong>{' '}
          {origin ? `(${Math.round(origin.x)}, ${Math.round(origin.y)}) px` : 'sin definir'}
        </p>
        <Button
          variant="secondary"
          aria-pressed={pickMode === 'origin'}
          onClick={() => setPickMode(pickMode === 'origin' ? null : 'origin')}
        >
          {pickMode === 'origin' ? 'Cancelar' : origin ? 'Cambiar origen' : 'Elegir origen'}
        </Button>
      </section>

      <section className="space-y-2">
        <p>
          <span aria-hidden="true">{k ? '✓' : '○'}</span> <strong>Escala:</strong>{' '}
          {k
            ? `1 px = ${formatNumber(k, 3)} m`
            : hasTwoPoints
              ? 'falta la distancia real'
              : pickMode === 'scaleB'
                ? 'marca el segundo extremo'
                : 'sin definir'}
        </p>
        <Button
          variant="secondary"
          aria-pressed={pickingScale}
          onClick={() => setPickMode(pickingScale ? null : 'scaleA')}
        >
          {pickingScale ? 'Cancelar' : scale ? 'Marcar de nuevo' : 'Marcar distancia conocida'}
        </Button>

        <label className="block">
          <span className="mb-1 block">Distancia real entre los dos puntos (m)</span>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={distanceText}
            disabled={!hasTwoPoints}
            onChange={(e) => handleDistance(e.target.value)}
            className="w-full rounded-md border border-ink/20 bg-white px-2 py-1 disabled:bg-ink/5"
            placeholder={hasTwoPoints ? 'Ej: 1.5' : 'Marca primero los dos extremos'}
          />
        </label>
        {hasTwoPoints && (
          <p className="text-ink/70">Longitud en el video: {formatNumber(pixelLength, 4)} px</p>
        )}
      </section>

      <ul className="list-disc space-y-1 pl-4 text-xs text-ink/70">
        <li>La distancia conocida debe estar en el mismo plano en que se mueve el balón.</li>
        <li>Los ejes quedan alineados con la imagen: x a la derecha, y hacia arriba.</li>
      </ul>

      <Button variant="ghost" onClick={resetReference} disabled={!origin && !scale}>
        Restablecer referencia
      </Button>
    </div>
  );
}