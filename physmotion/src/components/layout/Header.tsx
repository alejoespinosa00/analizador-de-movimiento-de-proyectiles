import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/analizador', label: 'Analizador' },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/equipo', label: 'Equipo' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-container-high/40 bg-white/75 backdrop-blur-xl">
      <nav className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-12">
        {/* Esquina izquierda: logo */}
        <Link
          to="/"
          className="group flex items-center gap-1 justify-self-start font-display text-lg font-semibold lowercase tracking-tight text-on-surface"
        >
          physmotion
          <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125" />
        </Link>

        {/* Centro: links */}
        <ul className="flex items-center gap-4 text-sm md:gap-6">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `font-display transition-colors ${
                    isActive
                      ? 'font-semibold text-on-surface'
                      : 'font-medium text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Esquina derecha: botón */}
        <Link
          to="/analizador"
          className="hidden justify-self-end rounded-full bg-primary px-5 py-2 font-display text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container sm:inline-flex"
        >
          Iniciar análisis
        </Link>
      </nav>
    </header>
  );
}
