import { useMemo, useState } from "react";
import { ATTENDANCE_COLORS } from "../constants/colors";
import AttendanceLegend from "./AttendanceLegend";
import HoverTooltip from "./HoverTooltip";
import SectionHeader from "./SectionHeader";

interface Party {
  partyId: number;
  partyName: string;
  attendanceCount: number;
  absentCount: number;
  justifiedAbsentCount: number;
  unjustifiedAbsentCount: number;
  avgAttendance: number;
  avgValidJust: number;
  avgInvalidJust: number;
  avgNoJust: number;
}

interface PartyComparisonChartProps {
  parties: Party[];
}

function partySegments(p: Party) {
  const total = p.attendanceCount + p.absentCount + p.justifiedAbsentCount + p.unjustifiedAbsentCount;
  if (total === 0) { return { a: 0, b: 0, c: 0, d: 0 }; }
  return {
    a: (p.attendanceCount / total) * 100,
    b: (p.justifiedAbsentCount / total) * 100,
    c: (p.unjustifiedAbsentCount / total) * 100,
    d: (p.absentCount / total) * 100,
  };
}

const C = ATTENDANCE_COLORS;

const TOOLTIP_ROWS: { label: string; key: keyof Party; color: string }[] = [
  { label: "Asistencia",                    key: "attendanceCount",        color: C.attendance  },
  { label: "Falta justificada",             key: "justifiedAbsentCount",   color: C.justified   },
  { label: "Falta sin just. válida",        key: "unjustifiedAbsentCount", color: C.unjustified },
  { label: "Falta sin justificación",       key: "absentCount",            color: C.noJust      },
];

export default function PartyComparisonChart({ parties }: PartyComparisonChartProps) {
  const [tooltip, setTooltip] = useState<{ party: Party; x: number; y: number } | null>(null);

  const partiesSorted = useMemo(() => {
    const attendancePct = (p: Party) => {
      const total = p.attendanceCount + p.absentCount + p.justifiedAbsentCount + p.unjustifiedAbsentCount;
      return total === 0 ? 0 : p.attendanceCount / total;
    };
    return [...parties].sort((a, b) => attendancePct(b) - attendancePct(a));
  }, [parties]);

  return (
    <>
      <SectionHeader
        title="Asistencia por partidos"
        description="Días de asistencias, ausentes con y sin justificación de todos miembros por partido político:"
      />
      <AttendanceLegend />
      <div
        style={{
          border: "1px solid #E5E5E5",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {partiesSorted.map((party) => {
          const seg = partySegments(party);
          return (
            <div
              key={party.partyId}
              style={{ display: "flex", alignItems: "center", gap: 12, cursor: "default" }}
              onMouseMove={(e) => { setTooltip({ party, x: e.clientX, y: e.clientY }); }}
              onMouseLeave={() => { setTooltip(null); }}
            >
              <span
                style={{
                  width: 230,
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#000",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {party.partyName}
              </span>
              <div
                style={{ flex: 1, display: "flex", height: 20, overflow: "hidden" }}
              >
                <div style={{ flex: seg.a, background: C.attendance, height: "100%" }} />
                <div style={{ flex: seg.b, background: C.justified, height: "100%" }} />
                <div style={{ flex: seg.c, background: C.unjustified, height: "100%" }} />
                <div style={{ flex: seg.d, background: C.noJust, height: "100%" }} />
              </div>
              <span
                style={{
                  width: 50,
                  flexShrink: 0,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  textAlign: "right",
                }}
              >
                {seg.a.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {tooltip && (
        <HoverTooltip
          x={tooltip.x}
          y={tooltip.y}
          title={tooltip.party.partyName}
          rows={TOOLTIP_ROWS.map(({ label, key, color }) => ({
            label,
            color,
            value: `${tooltip.party[key] as number} días`,
          }))}
        />
      )}
    </>
  );
}
