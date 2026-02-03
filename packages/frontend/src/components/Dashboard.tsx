import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import type { DashboardProps, PoliticianAttendance } from "../types/dashboard";

const PARTY_COLORS: Record<string, string> = {
  "Partido Comunista": "#E63946",
  "Partido Demócrata Cristiano": "#457B9D",
  "Partido Social Cristiano": "#2A9D8F",
  "Unión Demócrata Independiente": "#E9C46A",
  "Independientes": "#6A4C93",
  "Partido Republicano": "#1D3557",
  "Partido Socialista": "#F4A261",
  "Renovación Nacional": "#264653",
  "Frente Amplio": "#06D6A0",
  "Partido Liberal de Chile": "#118AB2",
  "Evópoli": "#8B5CF6",
  "Partido por la Democracia": "#EC4899",
  "Partido Radical": "#F97316",
};

const themes = {
  dark: {
    bg: "#0f0f1a",
    card: "#16162a",
    text: "#e0e0e0",
    textMuted: "#777",
    border: "rgba(255,255,255,0.06)",
    hoverBg: "rgba(255,255,255,0.07)",
    inputBg: "#1e1e33",
  },
  light: {
    bg: "#f8fafc",
    card: "#ffffff",
    text: "#1a1a2e",
    textMuted: "#64748b",
    border: "rgba(0,0,0,0.08)",
    hoverBg: "rgba(0,0,0,0.04)",
    inputBg: "#f1f5f9",
  },
};

function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || "#999";
}

function shortenPartyName(name: string): string {
  return name
    .replace("Partido ", "P. ")
    .replace("Unión Demócrata Independiente", "UDI")
    .replace("Renovación Nacional", "RN")
    .replace("Frente Amplio", "FA")
    .replace("Independientes", "Ind.")
    .replace("Partido por la Democracia", "PPD");
}

export default function Dashboard({
  politicians,
  partyAttendance,
  parties,
  years,
  initialYear,
}: DashboardProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<"party" | "individual">("party");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"pct" | "attendance">("pct");

  const t = themes[theme];

  // Load theme from localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved && saved !== theme) {
      setTheme(saved);
    }
  }, []);

  // Persist theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const filteredPoliticians = useMemo(() => {
    return politicians;
  }, [politicians]);

  // Build member lists from politician data for member table (keyed by partyId)
  const membersByPartyId = useMemo(() => {
    const map: Record<number, PoliticianAttendance[]> = {};
    filteredPoliticians.forEach((d) => {
      if (!map[d.partyId]) map[d.partyId] = [];
      map[d.partyId].push(d);
    });
    return map;
  }, [filteredPoliticians]);

  const partyAggregates = useMemo(() => {
    return partyAttendance
      .map((p) => ({
        party: p.partyName,
        members: membersByPartyId[p.partyId] || [],
        totalAttendance: p.attendanceCount,
        totalValid: p.justifiedAbsentCount,
        totalInvalid: p.unjustifiedAbsentCount,
        totalNoJust: Math.max(0, p.absentCount - p.justifiedAbsentCount),
        avgPct: parseFloat(p.attendanceAverage.toFixed(1)),
        count: (membersByPartyId[p.partyId] || []).length,
      }))
      .sort((a, b) => b.avgPct - a.avgPct);
  }, [partyAttendance, membersByPartyId]);

  const partyBarData = useMemo(() => {
    return partyAggregates.map((p) => ({
      name: shortenPartyName(p.party),
      fullName: p.party,
      avgPct: p.avgPct,
      members: p.count,
    }));
  }, [partyAggregates]);

  const individualData = useMemo(() => {
    const filtered = selectedParty
      ? filteredPoliticians.filter((d) => d.party === selectedParty)
      : filteredPoliticians;
    return [...filtered].sort((a, b) =>
      sortBy === "pct" ? b.pct - a.pct : b.attendance - a.attendance
    );
  }, [selectedParty, sortBy, filteredPoliticians]);

  const pieData = useMemo(() => {
    if (!selectedParty) return [];
    const p = partyAggregates.find((p) => p.party === selectedParty);
    if (!p) return [];
    return [
      {
        name: "Asistencia",
        value: p.totalAttendance,
        color: getPartyColor(selectedParty),
      },
      { name: "Justificado", value: p.totalValid, color: "#06D6A0" },
      { name: "No justificado", value: p.totalInvalid, color: "#F4A261" },
      { name: "Sin justificación", value: p.totalNoJust, color: "#E63946" },
    ];
  }, [selectedParty, partyAggregates]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div
        style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          color: t.text,
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 4,
            color: theme === "dark" ? "#fff" : "#1a1a2e",
            fontSize: 14,
          }}
        >
          {d.fullName || d.name}
        </div>
        {d.members && (
          <div style={{ color: t.textMuted }}>
            {d.members} miembro{d.members > 1 ? "s" : ""}
          </div>
        )}
        <div
          style={{
            color: getPartyColor(d.fullName || d.party) || "#06D6A0",
            fontWeight: 600,
            fontSize: 16,
            marginTop: 2,
          }}
        >
          {d.avgPct || d.pct}%
        </div>
      </div>
    );
  };

  const IndividualTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div
        style={{
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          color: t.text,
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 2,
            color: theme === "dark" ? "#fff" : "#1a1a2e",
            fontSize: 13,
          }}
        >
          {d.name}
        </div>
        <div style={{ color: t.textMuted, fontSize: 12 }}>{d.party}</div>
        <div style={{ marginTop: 6 }}>
          <span style={{ color: "#06D6A0" }}>Asist: {d.attendance}</span>
          <span style={{ color: t.textMuted, margin: "0 6px" }}>|</span>
          <span style={{ color: theme === "dark" ? "#fff" : "#1a1a2e" }}>
            {d.pct}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "'Georgia', serif",
        padding: "32px 24px",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .tab-btn { transition: all 0.25s; cursor: pointer; }
        .tab-btn:hover { background: ${t.hoverBg} !important; }
        .party-chip { transition: all 0.2s; cursor: pointer; }
        .party-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.35); }
        .party-chip.active { outline: 2px solid ${theme === "dark" ? "#fff" : "#1a1a2e"}; outline-offset: 2px; }
        .sort-btn { transition: background 0.2s; cursor: pointer; }
        .sort-btn:hover { background: ${t.hoverBg} !important; }
        .sort-btn.active { background: ${theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"} !important; border-color: ${theme === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)"} !important; }
        .recharts-cartesian-grid line { stroke: ${t.border}; }
        .recharts-text { fill: ${t.textMuted} !important; font-size: 11px !important; }
        .recharts-tooltip-wrapper { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5)); }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 28,
                fontWeight: 700,
                color: theme === "dark" ? "#fff" : "#1a1a2e",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              QuienAtiende
            </h1>
            <p
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                color: t.textMuted,
                fontSize: 14,
                margin: "6px 0 0",
                fontWeight: 300,
              }}
            >
              Asistencia a Sesiones de Sala · Cámara de Diputados
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Year Selector */}
            {/* <select
              value={initialYear}
              onChange={(e) => {
                window.location.href = `/${e.target.value}`;
              }}
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 14,
                border: `1px solid ${t.border}`,
                background: t.inputBg,
                color: t.text,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select> */}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 18,
                padding: "6px 10px",
                borderRadius: 14,
                border: `1px solid ${t.border}`,
                background: "transparent",
                color: t.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={
                theme === "dark"
                  ? "Cambiar a modo claro"
                  : "Cambiar a modo oscuro"
              }
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 48,
            height: 3,
            background: "linear-gradient(90deg, #E63946, #F4A261)",
            borderRadius: 2,
            marginBottom: 28,
          }}
        />

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(
            [
              ["party", "Por Partido"],
              ["individual", "Por Diputado/a"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              className="tab-btn"
              onClick={() => setView(key)}
              style={{
                fontFamily: "'Source Sans 3', sans-serif",
                fontSize: 14,
                fontWeight: view === key ? 600 : 400,
                padding: "8px 18px",
                borderRadius: 20,
                border: `1px solid ${view === key ? (theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)") : t.border}`,
                background:
                  view === key
                    ? theme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)"
                    : "transparent",
                color:
                  view === key
                    ? theme === "dark"
                      ? "#fff"
                      : "#1a1a2e"
                    : t.textMuted,
                outline: "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* PARTY VIEW */}
        {view === "party" && (
          <div>
            {/* Party Chips */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 24,
              }}
            >
              {partyAggregates.map((p) => (
                <div
                  key={p.party}
                  className={
                    "party-chip" + (selectedParty === p.party ? " active" : "")
                  }
                  onClick={() =>
                    setSelectedParty(
                      selectedParty === p.party ? null : p.party
                    )
                  }
                  style={{
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "5px 12px",
                    borderRadius: 14,
                    background: getPartyColor(p.party) + "22",
                    border: "1px solid " + getPartyColor(p.party) + "55",
                    color: getPartyColor(p.party),
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: getPartyColor(p.party),
                    }}
                  />
                  {p.party.replace("Partido ", "")}
                  <span
                    style={{
                      color: getPartyColor(p.party) + "aa",
                      marginLeft: 2,
                    }}
                  >
                    ({p.count})
                  </span>
                </div>
              ))}
            </div>

            {/* Bar Chart: Avg Attendance % by Party */}
            <div
              style={{
                background: t.card,
                borderRadius: 16,
                padding: "24px 16px 12px",
                border: `1px solid ${t.border}`,
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 17,
                  color: theme === "dark" ? "#fff" : "#1a1a2e",
                  margin: "0 0 4px 8px",
                  fontWeight: 600,
                }}
              >
                Porcentaje medio de asistencia
              </h2>
              <p
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 12,
                  color: t.textMuted,
                  margin: "0 0 16px 8px",
                }}
              >
                Promedio por partido · Ordenado de mayor a menor
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={partyBarData}
                  margin={{ top: 5, right: 16, left: -10, bottom: 40 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: t.textMuted }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={70}
                  />
                  <YAxis
                    domain={[80, 100]}
                    tick={{ fontSize: 11, fill: t.textMuted }}
                    tickFormatter={(v) => v + "%"}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: t.hoverBg }}
                  />
                  <Bar dataKey="avgPct" radius={[6, 6, 0, 0]} barSize={34}>
                    {partyBarData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={getPartyColor(entry.fullName)}
                        fillOpacity={
                          selectedParty && selectedParty !== entry.fullName
                            ? 0.3
                            : 0.85
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart if party is selected */}
            {selectedParty && (
              <div
                style={{
                  background: t.card,
                  borderRadius: 16,
                  padding: "24px",
                  border: `1px solid ${t.border}`,
                  marginBottom: 24,
                  display: "flex",
                  gap: 24,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 17,
                      color: theme === "dark" ? "#fff" : "#1a1a2e",
                      margin: "0 0 2px",
                      fontWeight: 600,
                    }}
                  >
                    {selectedParty}
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Source Sans 3', sans-serif",
                      fontSize: 12,
                      color: t.textMuted,
                      margin: 0,
                    }}
                  >
                    Distribución de días totales
                  </p>
                </div>
                <ResponsiveContainer width={180} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => val}
                      contentStyle={{
                        background: t.card,
                        border: `1px solid ${t.border}`,
                        borderRadius: 8,
                        color: t.text,
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 13,
                  }}
                >
                  {pieData.map((d, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          background: d.color,
                          display: "inline-block",
                        }}
                      />
                      <span style={{ color: t.textMuted }}>{d.name}:</span>
                      <span
                        style={{
                          color: theme === "dark" ? "#fff" : "#1a1a2e",
                          fontWeight: 600,
                        }}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member table for selected party */}
            {selectedParty && (
              <div
                style={{
                  background: t.card,
                  borderRadius: 16,
                  padding: 20,
                  border: `1px solid ${t.border}`,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 15,
                    color: theme === "dark" ? "#fff" : "#1a1a2e",
                    margin: "0 0 14px",
                    fontWeight: 600,
                  }}
                >
                  Miembros
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      fontFamily: "'Source Sans 3', sans-serif",
                      fontSize: 13,
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                        {[
                          "Nombre",
                          "Asistencia",
                          "Just. válida",
                          "No justificado",
                          "Sin just.",
                          "% Asist.",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              color: t.textMuted,
                              fontWeight: 500,
                              padding: "8px 10px",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {individualData.map((d, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
                          }}
                        >
                          <td
                            style={{
                              padding: "9px 10px",
                              color: theme === "dark" ? "#ddd" : "#333",
                              fontWeight: 500,
                            }}
                          >
                            {d.name}
                          </td>
                          <td
                            style={{
                              padding: "9px 10px",
                              color: theme === "dark" ? "#fff" : "#1a1a2e",
                            }}
                          >
                            {d.attendance}
                          </td>
                          <td style={{ padding: "9px 10px", color: "#06D6A0" }}>
                            {d.validJust}
                          </td>
                          <td style={{ padding: "9px 10px", color: "#F4A261" }}>
                            {d.invalidJust}
                          </td>
                          <td style={{ padding: "9px 10px", color: "#E63946" }}>
                            {d.noJust}
                          </td>
                          <td
                            style={{
                              padding: "9px 10px",
                              color: theme === "dark" ? "#fff" : "#1a1a2e",
                              fontWeight: 600,
                            }}
                          >
                            {d.pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INDIVIDUAL VIEW */}
        {view === "individual" && (
          <div>
            {/* Sort & Filter Controls */}
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 13,
                  color: t.textMuted,
                }}
              >
                Ordenar por:
              </span>
              {(
                [
                  ["pct", "% Asistencia"],
                  ["attendance", "Días asistidos"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  className={"sort-btn" + (sortBy === key ? " active" : "")}
                  onClick={() => setSortBy(key)}
                  style={{
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 13,
                    padding: "5px 14px",
                    borderRadius: 14,
                    border: `1px solid ${sortBy === key ? (theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)") : t.border}`,
                    background:
                      sortBy === key
                        ? theme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)"
                        : "transparent",
                    color:
                      sortBy === key
                        ? theme === "dark"
                          ? "#fff"
                          : "#1a1a2e"
                        : t.textMuted,
                    outline: "none",
                  }}
                >
                  {label}
                </button>
              ))}
              <div style={{ marginLeft: "auto" }}>
                <select
                  value={selectedParty || ""}
                  onChange={(e) => setSelectedParty(e.target.value || null)}
                  style={{
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 13,
                    padding: "5px 12px",
                    borderRadius: 14,
                    border: `1px solid ${t.border}`,
                    background: t.inputBg,
                    color: t.text,
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Todos los partidos</option>
                  {partyAggregates.map((p) => (
                    <option key={p.party} value={p.party}>
                      {p.party}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Horizontal bar chart per individual */}
            <div
              style={{
                background: t.card,
                borderRadius: 16,
                padding: "24px 16px 16px",
                border: `1px solid ${t.border}`,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 17,
                  color: theme === "dark" ? "#fff" : "#1a1a2e",
                  margin: "0 0 4px 8px",
                  fontWeight: 600,
                }}
              >
                Asistencia por Diputado/a
              </h2>
              <p
                style={{
                  fontFamily: "'Source Sans 3', sans-serif",
                  fontSize: 12,
                  color: t.textMuted,
                  margin: "0 0 16px 8px",
                }}
              >
                Porcentaje de asistencia individual
              </p>
              <ResponsiveContainer
                width="100%"
                height={Math.max(300, individualData.length * 30)}
              >
                <BarChart
                  data={individualData}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 140, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[80, 100]}
                    tick={{ fontSize: 11, fill: t.textMuted }}
                    tickFormatter={(v) => v + "%"}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: t.textMuted }}
                    width={136}
                  />
                  <Tooltip
                    content={<IndividualTooltip />}
                    cursor={{ fill: t.hoverBg }}
                  />
                  <Bar dataKey="pct" radius={[0, 5, 5, 0]} barSize={16}>
                    {individualData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={getPartyColor(entry.party)}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 16,
                justifyContent: "center",
              }}
            >
              {[...new Set(individualData.map((d) => d.party))].map((p) => (
                <div
                  key={p}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "'Source Sans 3', sans-serif",
                    fontSize: 11,
                    color: t.textMuted,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: getPartyColor(p),
                    }}
                  />
                  {p.replace("Partido ", "")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p
          style={{
            fontFamily: "'Source Sans 3', sans-serif",
            fontSize: 11,
            color: t.textMuted,
            textAlign: "center",
            marginTop: 32,
          }}
        >
          Datos extraídos de la Cámara de Diputados · {initialYear}
        </p>
      </div>
    </div>
  );
}
