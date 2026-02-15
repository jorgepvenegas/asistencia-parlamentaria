import { ATTENDANCE_COLORS } from "../constants/colors";

const ITEMS = [
  { color: ATTENDANCE_COLORS.attendance, label: "Asistencias" },
  { color: ATTENDANCE_COLORS.justified, label: "Ausentes con justificación que no afecta asistencia" },
  { color: ATTENDANCE_COLORS.unjustified, label: "Ausentes con justificacion que afecta asistencia" },
  { color: ATTENDANCE_COLORS.noJust, label: "Ausentes sin justificación" },
];

export default function AttendanceLegend() {
  return (
    <div className="flex gap-10 justify-end">
      {ITEMS.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ background: color, width: 10, height: 10 }} />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: "#5E5E5E",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
