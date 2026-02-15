interface SiteFooterProps {
  year: number;
}

const FOOTER_COLS = [
  { title: "DATOS", links: ["Asistencia", "Partidos", "Ranking", "Estadísticas"] },
  { title: "LEGAL", links: ["Términos de uso", "Privacidad", "Fuentes de datos"] },
  { title: "CONTACTO", links: ["GitHub", "Twitter / X", "Reportar error"] },
];

export default function SiteFooter({ year }: SiteFooterProps) {
  return (
    <footer style={{ background: "#000" }}>
      <div style={{ maxWidth: 1536, margin: "0 auto", padding: "48px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                background: "#DC2626",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
              }}
            >
              <span style={{ color: "#FAFAFA", fontWeight: 700, fontSize: 12 }}>C</span>
            </div>
            <span style={{ color: "#FAFAFA", fontWeight: 600, fontSize: 14, letterSpacing: -1 }}>
              CongresoAbierto
            </span>
          </div>
          <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Plataforma ciudadana de transparencia parlamentaria. Datos públicos para una democracia
            informada.
          </p>
        </div>
        <div style={{ display: "flex", gap: 64 }}>
          {FOOTER_COLS.map(({ title, links }) => (
            <div key={title} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#FAFAFA",
                  letterSpacing: 1,
                }}
              >
                {title}
              </span>
              {links.map((link) => (
                <a key={link} href="#" style={{ color: "#666", fontSize: 13, textDecoration: "none" }}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#666" }}>
          © {year} CongresoAbierto. Datos de dominio público.
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#666" }}>
          Hecho con datos del Congreso de la República
        </span>
      </div>
      </div>
    </footer>
  );
}
