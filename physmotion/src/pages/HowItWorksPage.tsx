import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

/* ───────── Marco común de las tarjetas ilustradas ───────── */

function CardFrame({
  glow,
  blob,
  flip = false,
  children,
}: {
  glow: string;
  blob: string;
  flip?: boolean;
  children: ReactNode;
}) {
  const top = flip ? '-top-6 -left-6' : '-top-6 -right-6';
  const bottom = flip ? '-bottom-8 -right-8' : '-bottom-8 -left-8';
  return (
    <div className="relative flex items-center justify-center">
      <div className={`pointer-events-none absolute inset-0 scale-95 rounded-3xl blur-2xl ${glow}`} />
      <div className="relative flex aspect-[4/3] w-full max-w-[500px] flex-col justify-between overflow-hidden rounded-card bg-surface-container-lowest p-space-lg shadow-md">
        <div className={`pointer-events-none absolute h-24 w-24 rounded-full ${top} ${blob}`} />
        <div className={`pointer-events-none absolute h-28 w-28 rounded-full bg-surface-container-low/80 ${bottom}`} />
        {children}
      </div>
    </div>
  );
}

const Header = ({ left, chip, chipClass }: { left: ReactNode; chip: string; chipClass: string }) => (
  <div className="z-10 flex items-center justify-between">
    <span className="font-display text-label-sm text-on-surface-variant">{left}</span>
    <span className={`rounded-full px-2 py-0.5 font-display text-label-sm ${chipClass}`}>{chip}</span>
  </div>
);

const Footer = ({ children }: { children: ReactNode }) => (
  <div className="z-10 flex items-center justify-between rounded-panel bg-surface-container-low px-space-md py-2 font-display text-label-sm text-on-surface-variant">
    {children}
  </div>
);

const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className="relative z-10 my-auto flex items-center justify-center py-space-sm">
    <div
      className={`relative flex h-44 w-full items-center justify-center rounded-panel bg-surface-container-low/50 p-3 ${className}`}
    >
      {children}
    </div>
  </div>
);

/* ───────── Las 4 ilustraciones ───────── */

function VideoCard() {
  return (
    <CardFrame glow="bg-primary-fixed-dim/40" blob="bg-surface-container-high/40">
      <div className="z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]/70" />
          <span className="ml-2 font-display text-label-sm text-on-surface-variant">clip_lanzamiento_001.mp4</span>
        </div>
        <span className="rounded-full bg-surface-container px-2 py-0.5 font-display text-label-sm text-primary">
          60 fps · 1080p
        </span>
      </div>

      <div className="relative z-10 my-auto py-space-sm">
        <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-panel bg-surface-container-low/70">
          <div className="absolute right-16 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
            t₁₄
          </div>
          <div className="absolute right-16 top-6 h-8 w-8 scale-150 animate-pulse rounded-full border border-dashed border-primary motion-reduce:animate-none" />
          <div className="z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-lowest text-primary shadow-sm">
            <Icon name="play_circle" className="text-[36px]" />
          </div>
        </div>
      </div>

      <div className="z-10 space-y-2">
        <div className="flex items-center justify-between font-display text-label-sm text-on-surface-variant">
          <span>
            Fotograma: <strong className="text-on-surface">042 / 180</strong>
          </span>
          <span>00:00.700 s</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full w-[42%] rounded-full bg-primary" />
        </div>
        <div className="flex items-center justify-center gap-space-md pt-1 text-on-surface-variant">
          {['skip_previous', 'fast_rewind'].map((i) => (
            <Icon key={i} name={i} className="text-[18px]" />
          ))}
          <span className="flex rounded-full bg-on-surface p-1.5 text-surface">
            <Icon name="play_arrow" className="text-[16px]" />
          </span>
          {['fast_forward', 'skip_next'].map((i) => (
            <Icon key={i} name={i} className="text-[18px]" />
          ))}
        </div>
      </div>
    </CardFrame>
  );
}

function CalibrationCard() {
  return (
    <CardFrame glow="bg-secondary-fixed/40" blob="bg-secondary-fixed-dim/30" flip>
      <Header left="Calibración Espacial" chip="Ejes Ortogonales" chipClass="bg-[#f5efff] text-secondary" />
      <Panel>
        <svg
          className="h-full w-full"
          viewBox="0 0 340 160"
          role="img"
          aria-label="Sistema de ejes con barra de escala de 1 metro"
        >
          <defs>
            <marker id="ax" markerWidth="6" markerHeight="6" refX="6" refY="5" viewBox="0 0 10 10" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#6b38d4" />
            </marker>
          </defs>
          <line x1="40" y1="130" x2="310" y2="130" stroke="#6b38d4" strokeWidth="2.5" markerEnd="url(#ax)" />
          <line x1="40" y1="130" x2="40" y2="15" stroke="#6b38d4" strokeWidth="2.5" markerEnd="url(#ax)" />
          <circle cx="40" cy="130" r="5" fill="#3525cd" />
          <text x="24" y="148" fontSize="12" fontWeight="600" fill="#0b1c30">(0,0)</text>
          <text x="315" y="134" fontSize="13" fontWeight="700" fill="#6b38d4">+X (m)</text>
          <text x="34" y="12" fontSize="13" fontWeight="700" fill="#6b38d4">+Y (m)</text>
          <g transform="translate(100,50)">
            <rect width="160" height="34" rx="8" fill="#fff" />
            <line x1="16" y1="17" x2="144" y2="17" stroke="#3525cd" strokeWidth="2" />
            <line x1="16" y1="10" x2="16" y2="24" stroke="#3525cd" strokeWidth="2" />
            <line x1="144" y1="10" x2="144" y2="24" stroke="#3525cd" strokeWidth="2" />
            <text x="80" y="14" fontSize="10" fontWeight="700" textAnchor="middle" fill="#0b1c30">1.00 metro</text>
            <text x="80" y="27" fontSize="9" textAnchor="middle" fill="#464555">= 142.8 píxeles</text>
          </g>
        </svg>
      </Panel>
      <Footer>
        <span className="flex items-center gap-2 text-on-surface">
          <Icon name="straighten" className="text-[18px] text-secondary" /> Escala activa:
        </span>
        <span className="font-bold text-secondary">0.0070 m / px</span>
      </Footer>
    </CardFrame>
  );
}

function ParabolaCard() {
  const nodes: [number, number][] = [
    [30, 135],
    [65, 98],
    [105, 62],
    [215, 62],
    [255, 98],
    [300, 135],
  ];
  return (
    <CardFrame glow="bg-[#a7f3d0]/30" blob="bg-[#d1fae5]/60">
      <Header left="Trazado de Parábola Cinética" chip="8 Puntos Registrados" chipClass="bg-[#ecfdf5] text-[#059669]" />
      <Panel className="p-2">
        <svg
          className="h-full w-full"
          viewBox="0 0 340 160"
          role="img"
          aria-label="Parábola con puntos registrados y vectores de velocidad"
        >
          <defs>
            <marker id="av" markerWidth="5" markerHeight="5" refX="6" refY="5" viewBox="0 0 10 10" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#3525cd" />
            </marker>
            <marker id="ao" markerWidth="5" markerHeight="5" refX="6" refY="5" viewBox="0 0 10 10" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#f97316" />
            </marker>
          </defs>
          <line x1="20" y1="140" x2="320" y2="140" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,4" />
          <path d="M 30 135 Q 160 10, 300 135" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3,3" />
          {nodes.map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r="4.5" fill="#059669" />
          ))}
          <circle cx="160" cy="42" r="6" fill="#3525cd" stroke="#fff" strokeWidth="2" />
          <line x1="160" y1="42" x2="210" y2="42" stroke="#3525cd" strokeWidth="2" markerEnd="url(#av)" />
          <text x="180" y="34" fontSize="10" fontWeight="700" fill="#3525cd">vₓ = 7.4 m/s</text>
          <line x1="30" y1="135" x2="70" y2="85" stroke="#f97316" strokeWidth="2" markerEnd="url(#ao)" />
          <text x="45" y="75" fontSize="10" fontWeight="700" fill="#f97316">v₀ (48°)</text>
          <text x="160" y="24" fontSize="11" fontWeight="600" textAnchor="middle" fill="#0b1c30">H_máx = 3.12 m</text>
        </svg>
      </Panel>
      <Footer>
        <span>
          Último nodo: <strong className="text-on-surface">P₇ (x: 4.82m, y: 1.15m)</strong>
        </span>
        <span className="font-semibold text-[#059669]">Δt = +0.016s</span>
      </Footer>
    </CardFrame>
  );
}

function ResultsCard() {
  const metrics = [
    ['Velocidad v₀', '8.42 m/s', 'text-on-surface'],
    ['Ángulo θ', '51.4°', 'text-on-surface'],
    ['Alcance X_max', '7.18 m', 'text-[#ea580c]'],
  ];
  return (
    <CardFrame glow="bg-[#fed7aa]/35" blob="bg-[#ffedd5]/70" flip>
      <div className="z-10 flex items-center justify-between font-display text-label-sm">
        <div className="flex items-center gap-1.5 text-on-surface">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Medido
          <span className="mx-1 text-on-surface-variant">·</span>
          <span className="h-2 w-2 rounded-full bg-primary" /> Calculado
        </div>
        <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[#ea580c]">R² = 0.994</span>
      </div>

      <div className="relative z-10 my-auto flex flex-col gap-2 py-space-sm">
        <div className="rounded-panel bg-surface-container-low/70 px-space-md py-2.5 text-center shadow-sm">
          <p className="font-display text-title-md tracking-wide text-on-surface">
            <span className="font-bold text-primary">y(t)</span> = y₀ + v₀ᵧ · t − ½ g · t²
          </p>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            x(t) = x₀ + (v₀ · cos θ) · t &nbsp;|&nbsp; g = 9.81 m/s²
          </p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {metrics.map(([label, value, color]) => (
            <div key={label} className="rounded-panel bg-surface-container-lowest p-2 text-center shadow-sm">
              <span className="block font-display text-[11px] font-semibold uppercase text-on-surface-variant">
                {label}
              </span>
              <span className={`font-display text-title-md font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <Footer>
        <span>Exportación disponible:</span>
        <span className="font-semibold text-primary">CSV · PDF Científico</span>
      </Footer>
    </CardFrame>
  );
}

/* ───────── Datos de los pasos (clases completas para que Tailwind las detecte) ───────── */

const steps = [
  {
    n: '01',
    icon: 'videocam',
    title: 'Carga tu video del lanzamiento',
    desc: 'Sube cualquier grabación cotidiana de un tiro a canasta, patada o lanzamiento desde tu móvil o cámara. La plataforma extrae cada fotograma a 60 FPS sin pérdida de resolución ni compresión destructiva.',
    items: [
      'Carga instantánea de formatos MP4, MOV y WebM',
      'Soporte de alta velocidad y análisis de FPS',
      'Sin necesidad de sensores ni equipo de laboratorio',
    ],
    num: 'text-[#3b82f6]/40',
    badge: 'bg-primary text-on-primary',
    check: 'bg-primary/10 text-primary',
    Card: VideoCard,
  },
  {
    n: '02',
    icon: 'square_foot',
    title: 'Calibra el sistema de referencia',
    desc: 'Fija el origen de coordenadas (0,0), orienta los ejes X e Y según la perspectiva del video e ingresa una medida real de referencia (como la altura del aro o el diámetro del balón) para convertir píxeles en metros con rigor científico.',
    items: [
      'Definición instantánea de origen (X₀, Y₀) con un solo clic',
      'Calibrador métrico de escala bidireccional (px → metros)',
      'Corrección de ángulo de perspectiva y rotación de plano',
    ],
    num: 'text-[#c084fc]/40',
    badge: 'bg-secondary text-on-secondary',
    check: 'bg-secondary/10 text-secondary',
    Card: CalibrationCard,
  },
  {
    n: '03',
    icon: 'timeline',
    title: 'Registra los puntos de la trayectoria',
    desc: 'Examina la secuencia fotograma a fotograma y selecciona con precisión la posición del proyectil en cada instante t. Cada clic genera una marca con coordenada temporal y espacial verificable en el plano cartesiano.',
    items: [
      'Marcado manual milimétrico fotograma a fotograma',
      'Trazado parabólico predictivo en tiempo real',
      'Control fino de timestamp (Δt)',
    ],
    num: 'text-[#10b981]/40',
    badge: 'bg-[#059669] text-white',
    check: 'bg-[#059669]/10 text-[#059669]',
    Card: ParabolaCard,
  },
  {
    n: '04',
    icon: 'functions',
    title: 'Obtén cálculos, ecuaciones y gráficas',
    desc: 'PhysMotion computa instantáneamente la velocidad inicial, ángulo de disparo, altura máxima (Y_max), alcance horizontal (X_max) y aceleración, mostrando el desglose paso a paso y la exportación rigurosa de datos.',
    items: [
      'Fórmulas y deducción de cinemática completa paso a paso',
      'Gráficas paramétricas interactivas X(t), Y(t) y V(t)',
      'Distinción rigurosa entre datos medidos vs. modelo teórico',
    ],
    num: 'text-[#fb923c]/40',
    badge: 'bg-[#ea580c] text-white',
    check: 'bg-[#ea580c]/10 text-[#ea580c]',
    Card: ResultsCard,
  },
];

/* ───────── Página ───────── */

export default function HowItWorksPage() {
  return (
    <main className="relative w-full overflow-hidden bg-surface text-on-surface antialiased">
      {/* Resplandores atmosféricos de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full max-w-[1280px] -translate-x-1/2 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full bg-primary-fixed-dim/30 blur-[130px]" />
        <div className="absolute right-10 top-48 h-[460px] w-[460px] rounded-full bg-secondary-fixed/40 blur-[120px]" />
        <div className="absolute left-10 top-[900px] h-[480px] w-[480px] rounded-full bg-surface-container-high/60 blur-[140px]" />
        <div className="absolute right-1/4 top-[1600px] h-[500px] w-[500px] rounded-full bg-secondary-fixed/30 blur-[130px]" />
        <div className="absolute left-1/3 top-[2300px] h-[540px] w-[540px] rounded-full bg-primary-fixed/40 blur-[140px]" />
      </div>

      <header className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-margin pb-space-2xl pt-space-xl text-center md:px-gutter-desktop">
        <h1 className="max-w-3xl font-display text-headline-lg tracking-tight text-on-surface">Cómo funciona</h1>
        <p className="mt-space-sm max-w-2xl text-body-lg text-on-surface-variant">
          Del video grabado al cálculo cinemático exacto en cuatro pasos guiados, con rigor físico y trazabilidad
          milimétrica.
        </p>
      </header>

      <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center space-y-space-3xl px-margin pb-space-3xl md:px-gutter-desktop">
        {steps.map(({ n, icon, title, desc, items, num, badge, check, Card }, i) => {
          const reversed = i % 2 === 1; // pasos 02 y 04: ilustración a la izquierda en desktop
          return (
            <article key={n} className="relative flex w-full flex-col">
              <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12 lg:gap-space-2xl">
                <div className={`flex flex-col items-start text-left lg:col-span-6 ${reversed ? 'lg:order-2' : ''}`}>
                  <span className={`-mb-2 select-none font-display text-display leading-none tracking-tight ${num}`}>
                    {n}
                  </span>
                  <div className="mb-space-md flex items-center gap-space-sm">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${badge}`}>
                      <Icon name={icon} className="text-[20px]" />
                    </div>
                    <h2 className="font-display text-headline-sm text-on-surface">{title}</h2>
                  </div>
                  <p className="mb-space-lg text-body-md leading-relaxed text-on-surface-variant">{desc}</p>
                  <ul className="flex w-full flex-col gap-space-sm">
                    {items.map((t) => (
                      <li key={t} className="flex items-center gap-space-sm text-body-md">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${check}`}>
                          <Icon name="check" className="text-[14px]" />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`lg:col-span-6 ${reversed ? 'lg:order-1' : ''}`}>
                  <Card />
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className="flex w-full justify-center pt-space-2xl text-on-surface-variant/40" aria-hidden="true">
                  <Icon name="arrow_downward" className="animate-bounce text-[28px] motion-reduce:animate-none" />
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-margin pb-space-3xl md:px-gutter-desktop">
        <div className="relative flex w-full flex-col items-center overflow-hidden rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-md md:p-space-2xl">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary-fixed-dim/30 blur-3xl" />
          <h3 className="max-w-xl font-display text-headline-md tracking-tight">
            ¿Listo para analizar tu primer lanzamiento?
          </h3>
          <p className="mb-space-lg mt-space-xs max-w-md text-body-md text-on-surface-variant">
            Accede al analizador de movimiento y procesa tus secuencias de física en minutos con máxima precisión.
          </p>
          <div className="z-10 flex flex-col items-center gap-space-md sm:flex-row">
            <Link
              to="/analizador"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-on-surface px-space-xl py-space-sm font-display text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary"
            >
              Comenzar análisis ahora <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
            <Link
              to="/resultados"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-low px-space-lg py-space-sm font-display text-label-md text-on-surface transition-colors hover:bg-surface-container"
            >
              <Icon name="menu_book" className="text-[18px]" /> Ver documentación física
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}