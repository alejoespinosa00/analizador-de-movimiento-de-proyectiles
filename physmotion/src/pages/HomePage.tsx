import { Link } from 'react-router-dom';

/** TODO(sprint-6): propósito, beneficios y diseño final. */
export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">PhysMotion</h1>
      <p className="max-w-prose">
        Analiza el movimiento de un proyectil directamente sobre un video: marca la trayectoria,
        calibra la escala y obtén velocidades, alcance y altura máxima con sus ecuaciones.
      </p>
      <Link
        to="/analizador"
        className="inline-block rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
      >
        Comenzar análisis
      </Link>
    </div>
  );
}
