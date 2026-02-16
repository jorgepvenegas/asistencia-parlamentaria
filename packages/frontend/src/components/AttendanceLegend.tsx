import { ATTENDANCE_COLORS } from '../constants/colors';

const ITEMS = [
  { color: ATTENDANCE_COLORS.attendance, label: 'Asistencias' },
  {
    color: ATTENDANCE_COLORS.justified,
    label: 'Ausentes con justificación que no afecta asistencia',
  },
  {
    color: ATTENDANCE_COLORS.unjustified,
    label: 'Ausentes con justificacion que afecta asistencia',
  },
  { color: ATTENDANCE_COLORS.noJust, label: 'Ausentes sin justificación' },
];

const RESPONSIVE = `
  .legend-row { display: flex; flex-wrap: wrap; gap: 16px; justify-content: flex-end; }
  @media (max-width: 767px) {
    .legend-row { justify-content: flex-start; gap: 12px; }
    .legend-label { font-size: 10px !important; }
  }
`;

export default function AttendanceLegend() {
  return (
    <>
      <style>{RESPONSIVE}</style>
      <div className="legend-row">
        {ITEMS.map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ background: color, width: 10, height: 10, flexShrink: 0 }} />
            <span
              className="legend-label"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                color: '#5E5E5E',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
