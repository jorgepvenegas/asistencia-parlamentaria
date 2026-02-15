import { useMemo } from "react";
import type { PoliticianAttendance, PartyAttendance } from "../types/dashboard";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import GeneralAttendance from "./GeneralAttendance";

interface LandingPageProps {
  politicians: PoliticianAttendance[];
  partyAttendance: PartyAttendance[];
  initialYear: number;
}

export default function LandingPage({
  politicians,
  partyAttendance,
  initialYear,
}: LandingPageProps) {
  const partyCount = useMemo(() => {
    const names = new Set(politicians.map((p) => p.party));
    return names.size;
  }, [politicians]);

  const avgAttendance = useMemo(() => {
    if (!politicians.length) { return 0; }
    return politicians.reduce((s, p) => s + p.avgAttendance, 0) / politicians.length;
  }, [politicians]);

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: "#FAFAFA", color: "#000", margin: 0 }}>
      <SiteHeader />

      {/* HERO */}
      <section style={{ background: "#000" }}>
        <div style={{ maxWidth: 1536, margin: "0 auto", padding: "80px 64px 64px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              border: "1px solid #333",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                background: "#22C55E",
                width: 8,
                height: 8,
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: "#999",
                fontWeight: 500,
              }}
            >
              Datos actualizados — Periodo {initialYear}
            </span>
          </div>
          <h1
            style={{
              color: "#FAFAFA",
              fontWeight: 700,
              fontSize: 56,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 700,
              margin: "0 0 24px",
            }}
          >
            Quién atendió sesiones
            <br />
            del Congreso?
          </h1>
          <p
            style={{ color: "#999", fontSize: 16, lineHeight: 1.6, maxWidth: 600, margin: "0 0 32px" }}
          >
            Conoce quién asiste, quién falta, y por qué. Transparencia para una mejor democracia.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <a
              href="#asistencia"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#DC2626",
                color: "#FAFAFA",
                padding: "14px 28px",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Ver asistencia ↓
            </a>
            <a
              href="#partidos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #333",
                color: "#FAFAFA",
                padding: "14px 28px",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Comparar partidos
            </a>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ background: "#F5F5F5", borderBottom: "1px solid #E5E5E5" }}>
        <div
          style={{
            maxWidth: 1536,
            margin: "0 auto",
            display: "flex",
            gap: 48,
            alignItems: "center",
            padding: "20px 64px",
          }}
        >
          {[
            { value: politicians.length.toString(), label: "diputados", highlight: false },
            { value: partyCount.toString(), label: "partidos políticos", highlight: false },
            // { value: avgAttendance.toFixed(1) + "%", label: "asistencia promedio", highlight: true },
          ].map(({ value, label, highlight }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: -1,
                  color: highlight ? "#DC2626" : "#000",
                }}
              >
                {value}
              </span>
              <span
                style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#5E5E5E" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <main id="asistencia">
        <div style={{ maxWidth: 1536, margin: "0 auto", padding: "48px 64px" }}>
          <GeneralAttendance partyAttendance={partyAttendance} initialYear={initialYear} />
        </div>
      </main>

      <SiteFooter year={initialYear} />
    </div>
  );
}
