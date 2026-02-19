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

export default function AttendanceLegend() {
  return (
    <div className="flex flex-col gap-4 py-6">
      {ITEMS.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div style={{ background: color, width: 10, height: 10 }} className="shrink-0" />
          <span className="font-mono text-xs font-medium text-subtle">{label}</span>
        </div>
      ))}
    </div>
  );
}
