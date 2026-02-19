interface SiteFooterProps {
  year: number;
}

const FOOTER_COLS = [
  {
    title: 'DATOS',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Partidos', href: '/partidos' },
      { label: 'Diputados', href: '/diputados' },
    ],
  },
  {
    title: 'CONTACTO',
    links: [
      { label: 'GitHub', href: 'https://github.com/jorgepvenegas/asistencia-camara' },
      { label: 'Twitter / X', href: '#' },
      { label: 'Reportar error', href: '#' },
    ],
  },
];

export default function SiteFooter({ year }: SiteFooterProps) {
  return (
    <footer className="bg-black">
      <div className="max-w-[1536px] mx-auto box-border px-4 py-12 md:px-5 md:py-8">
        <div className="flex flex-col justify-between mb-10 md:flex-row gap-8">
          <div className="md:max-w-[360px]">
            <div className="flex items-center gap-3 mb-4">
              <a href="/" className="flex items-center gap-3 no-underline">
                <div className="bg-brand-red w-6 h-6 flex items-center justify-center rounded-sm">
                  <span className="text-surface font-bold text-xs">C</span>
                </div>
                <span className="text-surface font-semibold text-sm tracking-tight">
                  CongresoAbierto
                </span>
              </a>
            </div>
            <p className="text-subtle text-sm leading-relaxed m-0">
              Plataforma ciudadana de transparencia parlamentaria. Datos públicos para una
              democracia informada.
            </p>
          </div>
          <div className="grid grid-cols-2 md:flex gap-16 md:gap-8 md:flex-wrap">
            {FOOTER_COLS.map(({ title, links }) => (
              <div key={title} className="flex flex-col gap-4">
                <span className="font-mono text-xs font-semibold text-surface tracking-wide">
                  {title}
                </span>
                {links.map((link) => (
                  <a key={link.label} href={link.href} className="text-subtle text-sm no-underline">
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-col justify-between items-center border-t border-[#333] pt-6 md:flex-row md:items-start gap-2">
          <span className="font-mono text-xs text-subtle">
            © {year} Datos de dominio público. Hecho con datos de la Cámara de Diputados de Chile.
          </span>
        </div>
      </div>
    </footer>
  );
}
