const RESPONSIVE = `
  .footer-inner  { padding: 48px 64px; }
  .footer-top    { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .footer-cols   { display: flex; gap: 64px; }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; }
  @media (max-width: 767px) {
    .footer-inner  { padding: 32px 20px; }
    .footer-top    { flex-direction: column; gap: 32px; }
    .footer-cols   { gap: 32px; flex-wrap: wrap; }
    .footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
  }
`;

interface SiteFooterProps {
  year: number;
}

const FOOTER_COLS = [
  {
    title: 'DATOS',
    links: [
      { label: 'Asistencia', href: '/' },
      { label: 'Partidos', href: '/partidos' },
      { label: 'Ranking', href: '/diputados' },
      { label: 'Estadísticas', href: '/#ranking' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Términos de uso', href: '#' },
      { label: 'Privacidad', href: '#' },
      { label: 'Fuentes de datos', href: '/acerca-de' },
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
    <>
      <style>{RESPONSIVE}</style>
      <footer style={{ background: '#000' }}>
        <div
          className="footer-inner"
          style={{ maxWidth: 1536, margin: '0 auto', boxSizing: 'border-box' }}
        >
          <div className="footer-top">
            <div style={{ maxWidth: 360 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <a
                  href="/"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#DC2626',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                    }}
                  >
                    <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: 12 }}>C</span>
                  </div>
                  <span
                    style={{ color: '#FAFAFA', fontWeight: 600, fontSize: 14, letterSpacing: -1 }}
                  >
                    CongresoAbierto
                  </span>
                </a>
              </div>
              <p style={{ color: '#9a9a9a', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                Plataforma ciudadana de transparencia parlamentaria. Datos públicos para una
                democracia informada.
              </p>
            </div>
            <div className="footer-cols">
              {FOOTER_COLS.map(({ title, links }) => (
                <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#FAFAFA',
                      letterSpacing: 1,
                    }}
                  >
                    {title}
                  </span>
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{ color: '#9a9a9a', fontSize: 13, textDecoration: 'none' }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="footer-bottom" style={{ borderTop: '1px solid #333', paddingTop: 24 }}>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#9a9a9a' }}
            >
              © {year} CongresoAbierto. Datos de dominio público.
            </span>
            <span
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#9a9a9a' }}
            >
              Hecho con datos del Congreso de la República
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
