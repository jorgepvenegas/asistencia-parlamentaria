import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Asistencia', href: '#asistencia', active: true },
  { label: 'Partidos', href: '#partidos', active: false },
  { label: 'Ranking', href: '#ranking', active: false },
  { label: 'Acerca de', href: '#acerca', active: false },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .site-nav-desktop { display: flex; }
        .site-nav-hamburger { display: none; }
        .site-nav-mobile { display: none; }
        @media (max-width: 767px) {
          .site-nav-desktop { display: none; }
          .site-nav-hamburger { display: flex; }
          .site-nav-mobile { display: flex; }
        }
      `}</style>

      <header style={{ background: '#000', position: 'relative' }}>
        {/* Desktop / mobile top bar */}
        <div
          style={{
            maxWidth: 1536,
            margin: '0 auto',
            padding: '16px 64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="site-header-inner"
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: '#DC2626',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: '#FAFAFA',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                C
              </span>
            </div>
            <span
              style={{
                color: '#FAFAFA',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: -1,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              CongresoAbierto
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="site-nav-desktop" style={{ gap: 32 }}>
            {NAV_ITEMS.map(({ label, href, active }) => (
              <a
                key={label}
                href={href}
                style={{
                  color: active ? '#FAFAFA' : '#999',
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  textDecoration: 'none',
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Hamburger button */}
          <button
            className="site-nav-hamburger"
            onClick={() => setOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              alignItems: 'flex-end',
            }}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span style={{ display: 'block', width: 22, height: 2, background: '#FAFAFA' }} />
            <span
              style={{
                display: 'block',
                width: open ? 22 : 14,
                height: 2,
                background: '#FAFAFA',
                transition: 'width 0.2s',
              }}
            />
            <span style={{ display: 'block', width: 22, height: 2, background: '#FAFAFA' }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <nav
            className="site-nav-mobile"
            style={{
              flexDirection: 'column',
              background: '#000',
              borderTop: '1px solid #222',
              padding: '8px 20px 20px',
              gap: 0,
            }}
          >
            {NAV_ITEMS.map(({ label, href, active }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  color: active ? '#FAFAFA' : '#999',
                  fontSize: 14,
                  fontWeight: active ? 500 : 400,
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderBottom: '1px solid #1a1a1a',
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <style>{`
        @media (max-width: 767px) {
          .site-header-inner {
            padding: 14px 20px !important;
          }
        }
      `}</style>
    </>
  );
}
