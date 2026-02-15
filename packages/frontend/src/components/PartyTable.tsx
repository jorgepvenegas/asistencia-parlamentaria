import type { ReactNode } from "react";
import { ATTENDANCE_COLORS } from "../constants/colors";

interface Party {
  partyId: number;
  partyName: string;
  attendanceCount: number;
  absentCount: number;
  justifiedAbsentCount: number;
  unjustifiedAbsentCount: number;
}

interface PartyTableProps {
  parties: Party[];
  memberCounts: Record<string, number>;
}

type Segments = { a: number; b: number; c: number; d: number };

type Col = {
  label: string;
  width: number;
  render: (party: Party, seg: Segments, memberCounts: Record<string, number>, attendColor: string) => ReactNode;
};

const C = ATTENDANCE_COLORS;

const COLS: Col[] = [
  {
    label: "PARTIDO",
    width: 300,
    render: (party) => (
      <span style={{ fontSize: 13, fontWeight: 500 }}>{party.partyName}</span>
    ),
  },
  {
    label: "MIEMBROS",
    width: 100,
    render: (party, _seg, memberCounts) => (
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500 }}>
        {memberCounts[party.partyName] || 0}
      </span>
    ),
  },
  {
    label: "DIAS DE ASISTENCIA",
    width: 180,
    render: (_party, seg, _memberCounts, attendColor) => (
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: attendColor }}>
        {seg.a.toFixed(1)}%
      </span>
    ),
  },
  {
    label: "AUSENTE CON JUSTIFICACION VALIDA",
    width: 180,
    render: (_party, seg) => (
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.justified }}>
        {seg.b.toFixed(1)}%
      </span>
    ),
  },
  {
    label: "AUSENTE CON JUSTIFICACION INVALIDA",
    width: 180,
    render: (_party, seg) => (
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.unjustified }}>
        {seg.c.toFixed(1)}%
      </span>
    ),
  },
  {
    label: "AUSENTE SIN JUSTIFICACION",
    width: 200,
    render: (_party, seg) => (
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.noJust }}>
        {seg.d.toFixed(1)}%
      </span>
    ),
  },
];

function partySegments(p: Party): Segments {
  const total = p.attendanceCount + p.absentCount;
  if (total === 0) { return { a: 0, b: 0, c: 0, d: 0 }; }
  const noJust = Math.max(0, p.absentCount - p.justifiedAbsentCount);
  return {
    a: (p.attendanceCount / total) * 100,
    b: (p.justifiedAbsentCount / total) * 100,
    c: (p.unjustifiedAbsentCount / total) * 100,
    d: (noJust / total) * 100,
  };
}

export default function PartyTable({ parties, memberCounts }: PartyTableProps) {
  return (
    <div style={{ border: "1px solid #E5E5E5" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#F5F5F5",
          padding: "14px 20px",
          borderBottom: "1px solid #E5E5E5",
          gap: 10,
        }}
      >
        {COLS.map(({ label, width }) => (
          <div key={label} style={{ width, flexShrink: 0 }}>
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
      </div>

      {/* Rows */}
      {parties.map((party) => {
        const seg = partySegments(party);
        const attendColor =
          seg.a >= 80 ? C.attendance : seg.a >= 60 ? C.unjustified : C.noJust;
        return (
          <div
            key={party.partyId}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: "1px solid #E5E5E5",
              gap: 10,
            }}
          >
            {COLS.map((col) => (
              <div key={col.label} style={{ width: col.width, flexShrink: 0 }}>
                {col.render(party, seg, memberCounts, attendColor)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
