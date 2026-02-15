import { useMemo } from "react";
import type { PartyAttendance } from "../types/dashboard";
import { ATTENDANCE_COLORS } from "../constants/colors";
import StatCards from "./StatCards";
import PartyComparisonChart from "./PartyComparisonChart";
import SectionHeader from "./SectionHeader";

interface GeneralAttendanceProps {
  partyAttendance: PartyAttendance[];
  initialYear: number;
}

const C: typeof ATTENDANCE_COLORS = ATTENDANCE_COLORS;


export default function GeneralAttendance({
  partyAttendance,
  initialYear,
}: GeneralAttendanceProps) {

  // console.table(sorted[1]);

  const overall = useMemo(() => {
    const totalAttend = partyAttendance.reduce((s, p) => s + p.attendanceCount, 0);
    const totalAbsent = partyAttendance.reduce((s, p) => s + p.absentCount, 0);
    const totalJust   = partyAttendance.reduce((s, p) => s + p.justifiedAbsentCount, 0);
    const totalUnjust = partyAttendance.reduce((s, p) => s + p.unjustifiedAbsentCount, 0);
    const totalNoJust = partyAttendance.reduce(
      (s, p) => s + Math.max(0, p.absentCount - p.justifiedAbsentCount),
      0,
    );
    const total = totalAttend + totalAbsent;
    if (total === 0) { return null; }
    return {
      attendPct: ((totalAttend / total) * 100).toFixed(1),
      attendFrac: totalAttend / total,
      justPct: ((totalJust / total) * 100).toFixed(1),
      justFrac: totalJust / total,
      unjustPct: ((totalUnjust / total) * 100).toFixed(1),
      unjustFrac: totalUnjust / total,
      noJustPct: ((totalNoJust / total) * 100).toFixed(1),
      noJustFrac: totalNoJust / total,
    };
  }, [partyAttendance]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Section header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <SectionHeader
          title="Asistencia general"
          description="Resumen de asistencia a sesiones de sala de todos los diputados"
        />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              border: "1px solid #E5E5E5",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>{initialYear}</span>
          </div>
        </div>
      </div>

      {/* Party tabs (informational, no selection) */}
      {/* <PartyTabs parties={sorted} memberCounts={memberCounts} /> */}

      {/* Overall stat cards */}
      {overall && (
        <StatCards
          cards={[
            { label: "ASISTENCIA PROMEDIO", pct: overall.attendPct, frac: overall.attendFrac, color: C.attendance },
            { label: "FALTAS JUSTIFICADAS", pct: overall.justPct, frac: overall.justFrac, color: C.justified },
            { label: "FALTAS SIN JUSTIFICACIÓN VÁLIDA", pct: overall.unjustPct, frac: overall.unjustFrac, color: C.unjustified },
            { label: "FALTAS SIN JUSTIFICACIÓN", pct: overall.noJustPct, frac: overall.noJustFrac, color: C.noJust },
          ]}
        />
      )}

      {/* Party comparison chart */}
      <PartyComparisonChart parties={partyAttendance} />

      {/* Party table */}
      {/* <PartyTable parties={sorted} memberCounts={memberCounts} /> */}

      {/* Pagination footer
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#999" }}
        >
          Mostrando {partyAttendance.length} de {partyAttendance.length} partidos
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#FAFAFA",
            fontSize: 12,
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
          }}
        >
          1
        </div>
      </div> */}
    </div>
  );
}
