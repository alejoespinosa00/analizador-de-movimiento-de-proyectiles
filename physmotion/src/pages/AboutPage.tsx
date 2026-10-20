import type { ReactNode } from 'react';

interface Member {
  name: string;
  role: string;
  /** URL del perfil de GitHub. Si falta, el botón se ve deshabilitado. */
  github?: string;
  icon: ReactNode;
}

const svgProps = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const NodesIcon = (
  <svg {...svgProps}>
    <circle cx="12" cy="5.5" r="2.2" />
    <circle cx="5.5" cy="18" r="2.2" />
    <circle cx="18.5" cy="18" r="2.2" />
    <path d="M11 7.6 6.6 15.9M13 7.6l4.4 8.3M7.7 18h8.6" />
  </svg>
);

const OrbitIcon = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="2.4" />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
  </svg>
);

const TerminalIcon = (
  <svg {...svgProps}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="m7.5 10 3 2.5-3 2.5M13 15h4" />
  </svg>
);

const TargetIcon = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </svg>
);

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const TEAM: Member[] = [
  {
    name: 'Alejandro Espinosa',
    role: 'Ingeniería de Software',
    github: 'https://github.com/alejoespinosa00',
    icon: NodesIcon,
  },
  {
    name: 'Valentina Sánchez',
    role: 'Ingeniería de Software',
    github: 'https://github.com/valentinasanchez-stack',
    icon: OrbitIcon,
  },
  {
    name: 'Alejandro González',
    role: 'Ingeniería de Software',
    github: 'https://github.com/AlejandroGonzalez-23' ,
    icon: TerminalIcon,
  },
  {
    name: 'Jasdiel Barrera',
    role: 'Ingeniería de Software',
    github: 'https://github.com/jasdi18' ,
    icon: TargetIcon,
  },
];

const linkClass =
  'mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink transition';

export default function AboutPage() {
  return (
    <section className="rounded-3xl bg-[linear-gradient(135deg,#e4dcff_0%,#f3f0ff_55%,#ffffff_100%)] px-6 py-12 sm:px-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-ink sm:text-6xl">PhysMotion</h1>
        <p className="mt-4 text-base text-ink/70 sm:text-lg">
          Estudiantes de Ingeniería de Software que diseñamos PhysMotion para llevar el análisis de
          proyectiles de la teoría al video.
        </p>
      </header>

      <ul className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((member) => (
          <li
            key={member.name}
            className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(91,70,180,0.12)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              {member.icon}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink">{member.name}</h2>
            <p className="mt-1 text-sm text-ink/60">{member.role}</p>

            {member.github ? (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`GitHub de ${member.name}`}
                className={`${linkClass} hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600`}
              >
                <GithubIcon />
              </a>
            ) : (
              <span aria-hidden="true" className={`${linkClass} opacity-40`}>
                <GithubIcon />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}