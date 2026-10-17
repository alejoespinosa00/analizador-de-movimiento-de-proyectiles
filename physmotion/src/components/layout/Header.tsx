import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/analizador', label: 'Analizador' },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/equipo', label: 'Equipo' },
];

export default function Header() {
  return (
    <header className="border-b border-ink/10 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-semibold">PhysMotion</span>
        <ul className="flex gap-4 text-sm">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => (isActive ? 'font-semibold text-brand-600' : '')}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
