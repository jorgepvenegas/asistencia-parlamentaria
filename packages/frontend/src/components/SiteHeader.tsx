import type React from "react";

const NAV_ITEMS = [
  { label: "Asistencia", href: "#asistencia", active: true },
  { label: "Partidos", href: "#partidos", active: false },
  { label: "Ranking", href: "#ranking", active: false },
  { label: "Acerca de", href: "#acerca", active: false },
];

const inner: React.CSSProperties = {
  maxWidth: 1536,
  margin: "0 auto",
  padding: "16px 64px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

export default function SiteHeader() {
  return (
    <header style={{ background: "#000" }}>
      <div style={inner}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            background: "#DC2626",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <span style={{ color: "#FAFAFA", fontWeight: 700, fontSize: 16 }}>C</span>
        </div>
        <span style={{ color: "#FAFAFA", fontWeight: 600, fontSize: 16, letterSpacing: -1 }}>
          CongresoAbierto
        </span>
      </div>
      <nav style={{ display: "flex", gap: 32 }}>
        {NAV_ITEMS.map(({ label, href, active }) => (
          <a
            key={label}
            href={href}
            style={{
              color: active ? "#FAFAFA" : "#999",
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              textDecoration: "none",
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      </div>
    </header>
  );
}
