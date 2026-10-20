import { Link } from 'react-router-dom';

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2" y="8" width="20" height="8" rx="1.5" />
      <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
    </svg>
  );
}

function PointerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 20h18" />
      <path d="M4 16c3-9 6-9 8-5s5 4 8-5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Fondo dentro del main, detrás del contenido */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-surface" aria-hidden="true">
        <img
          src="/fondo-home.png"
          alt=""
          className="h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent" />
      </div>

      {/* Contenido por encima del fondo */}
      <div className="relative z-10 flex min-h-[calc(100vh-12rem)] flex-col gap-16">
        {/* Bloque principal: centrado vertical y horizontalmente */}
        <div className="flex flex-1 items-center justify-center">
          <section className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-on-surface md:text-6xl">
              Convierte un video <br /> en física medible.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
              Transforma grabaciones cotidianas en mediciones precisas, trayectorias vectoriales y modelos
              cinemáticos instantáneos desde tu navegador, sin equipo de laboratorio adicional.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/analizador"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-on-surface px-8 py-4 font-display text-sm font-semibold text-surface shadow-[0_8px_20px_-4px_rgba(11,28,48,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary"
              >
                Comenzar análisis
                <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link
                to="/como-funciona"
                className="group inline-flex items-center justify-center gap-1 rounded-full px-6 py-4 font-display text-sm font-semibold text-on-surface transition-colors hover:text-primary"
              >
                Cómo funciona
                <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          </section>
        </div>

        {/* Franja inferior */}
        <section className="flex flex-col items-start justify-between gap-4 text-on-surface-variant md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary/70" />
            <span className="font-display text-xs font-semibold uppercase tracking-wider">
              Cinemática de proyectiles
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-3 text-sm font-medium text-on-surface lg:gap-x-24">
            <li className="flex items-center gap-2">
              <span className="text-outline"><RulerIcon /></span>
              Escala con distancia real
            </li>
            <li className="flex items-center gap-2">
              <span className="text-outline"><PointerIcon /></span>
              Puntos marcados a mano
            </li>
            <li className="flex items-center gap-2">
              <span className="text-outline"><ChartIcon /></span>
              Ecuaciones y gráficas
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
