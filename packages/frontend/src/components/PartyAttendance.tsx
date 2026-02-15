import { useState, useMemo } from "react";
import type { PartyAttendanceProps, PoliticianAttendance } from "../types/dashboard";
import type { PartyAttendance as PartyAttendanceType } from "../types/dashboard";
import { ATTENDANCE_COLORS } from "../constants/colors";
import AttendanceLegend from "./AttendanceLegend";
import StatCards from "./StatCards";
import DistributionBar from "./DistributionBar";

const C = ATTENDANCE_COLORS;

function politicianBarSegments(p: PoliticianAttendance) {
  const total = p.attendance + p.validJust + p.invalidJust + p.noJust;
  if (total === 0) { return { a: 0, b: 0, c: 0, d: 0 }; }
  return {
    a: (p.attendance / total) * 100,
    b: (p.validJust / total) * 100,
    c: (p.invalidJust / total) * 100,
    d: (p.noJust / total) * 100,
  };
}

function partyStatCards(party: PartyAttendanceType) {
  const total = party.attendanceCount + party.absentCount;
  if (total === 0) { return null; }
  const noJust = Math.max(0, party.absentCount - party.justifiedAbsentCount);
  return [
    {
      label: "DÍAS ASISTIDOS",
      pct: ((party.attendanceCount / total) * 100).toFixed(1),
      frac: party.attendanceCount / total,
      color: C.attendance,
    },
    {
      label: "FALTAS JUSTIFICADAS",
      pct: ((party.justifiedAbsentCount / total) * 100).toFixed(1),
      frac: party.justifiedAbsentCount / total,
      color: C.justified,
    },
    {
      label: "FALTAS SIN JUSTIFICACIÓN VÁLIDA",
      pct: ((party.unjustifiedAbsentCount / total) * 100).toFixed(1),
      frac: party.unjustifiedAbsentCount / total,
      color: C.unjustified,
    },
    {
      label: "FALTAS SIN JUSTIFICACIÓN",
      pct: ((noJust / total) * 100).toFixed(1),
      frac: noJust / total,
      color: C.noJust,
    },
  ];
}

const PER_PAGE = 10;

export default function PartyAttendance({
  politicians,
  partyAttendance,
  initialYear,
}: PartyAttendanceProps) {
  const membersByParty = useMemo(() => {
    const map: Record<string, PoliticianAttendance[]> = {};
    politicians.forEach((p) => {
      if (!map[p.party]) { map[p.party] = []; }
      map[p.party].push(p);
    });
    return map;
  }, [politicians]);

  const sortedParties = useMemo(
    () =>
      [...partyAttendance].sort(
        (a, b) =>
          (membersByParty[b.partyName] || []).length -
          (membersByParty[a.partyName] || []).length,
      ),
    [partyAttendance, membersByParty],
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(1);

  const selectedParty = sortedParties[selectedIdx];
  const members: PoliticianAttendance[] = selectedParty
    ? (membersByParty[selectedParty.partyName] || [])
    : [];
  const totalPages = Math.ceil(members.length / PER_PAGE);
  const pageMembers = members.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const statCards = selectedParty ? partyStatCards(selectedParty) : null;

  function selectParty(i: number) {
    setSelectedIdx(i);
    setPage(1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: -2,
              color: "#000",
              margin: "0 0 8px",
            }}
          >
            Asistencia por partido
          </h2>
          <p style={{ fontSize: 14, color: "#5E5E5E", margin: 0 }}>
            Selecciona un partido para ver la asistencia desglosada de cada congresista
          </p>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            border: "1px solid #E5E5E5",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500 }}>{initialYear}</span>
        </div>
      </div>

      {/* Party tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sortedParties.map((party, i) => (
          <button
            key={party.partyId}
            onClick={() => selectParty(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: i === selectedIdx ? "#000" : "transparent",
              border: i === selectedIdx ? "none" : "1px solid #E5E5E5",
              cursor: "pointer",
              color: i === selectedIdx ? "#FAFAFA" : "#5E5E5E",
              fontSize: 12,
              fontWeight: i === selectedIdx ? 600 : 500,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {party.partyName}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#999" }}>
              {(membersByParty[party.partyName] || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Stat cards */}
      {statCards && <StatCards cards={statCards} />}

      {/* Legend */}
      <AttendanceLegend />

      {/* Table */}
      <div style={{ border: "1px solid #E5E5E5" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#F5F5F5",
            padding: "14px 20px",
            borderBottom: "1px solid #E5E5E5",
          }}
        >
          {(
            [
              ["CONGRESISTA", 220],
              ["ASIST.", 80],
              ["F. JUST.", 80],
              ["F. S/V.", 80],
              ["F. S/J.", 80],
            ] as [string, number][]
          ).map(([label, w]) => (
            <div key={label} style={{ width: w, flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                {label}
              </span>
            </div>
          ))}
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              DISTRIBUCIÓN
            </span>
          </div>
        </div>

        {pageMembers.map((p) => {
          const seg = politicianBarSegments(p);
          const attendColor =
            p.pct >= 80 ? C.attendance : p.pct >= 60 ? C.unjustified : C.noJust;
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid #E5E5E5",
              }}
            >
              <div style={{ width: 220, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
              </div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    fontWeight: 500,
                    color: attendColor,
                  }}
                >
                  {p.pct.toFixed(1)}%
                </span>
              </div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.justified }}
                >
                  {seg.b.toFixed(1)}%
                </span>
              </div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.unjustified }}
                >
                  {seg.c.toFixed(1)}%
                </span>
              </div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <span
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.noJust }}
                >
                  {seg.d.toFixed(1)}%
                </span>
              </div>
              <DistributionBar a={seg.a} b={seg.b} c={seg.c} d={seg.d} />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#999" }}>
            Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, members.length)} de{" "}
            {members.length} congresistas
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: i + 1 === page ? "#000" : "transparent",
                  border: i + 1 === page ? "none" : "1px solid #E5E5E5",
                  color: i + 1 === page ? "#FAFAFA" : "#5E5E5E",
                  fontSize: 12,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: i + 1 === page ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
