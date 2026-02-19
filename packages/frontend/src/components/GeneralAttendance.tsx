import { useMemo } from 'react';
import type { PartyAttendance } from '../types/dashboard';
import { ATTENDANCE_COLORS } from '../constants/colors';
import StatCards from './StatCards';
import PartyComparisonChart from './PartyComparisonChart';

interface GeneralAttendanceProps {
  partyAttendance: PartyAttendance[];
  initialYear: number;
}

const C: typeof ATTENDANCE_COLORS = ATTENDANCE_COLORS;

export default function GeneralAttendance({
  partyAttendance,
  initialYear,
}: GeneralAttendanceProps) {
  const overall = useMemo(() => {
    const totalAttend = partyAttendance.reduce((s, p) => s + p.attendanceCount, 0);
    const totalJust = partyAttendance.reduce((s, p) => s + p.justifiedAbsentCount, 0);
    const totalUnjust = partyAttendance.reduce((s, p) => s + p.unjustifiedAbsentCount, 0);
    const totalAbsent = partyAttendance.reduce((s, p) => s + p.absentCount, 0);
    const adjustedTotal = totalAttend + totalJust + totalUnjust + totalAbsent;
    if (adjustedTotal === 0) {
      return null;
    }
    return {
      attendPct: ((totalAttend / adjustedTotal) * 100).toFixed(1),
      attendFrac: totalAttend / adjustedTotal,
      justPct: ((totalJust / adjustedTotal) * 100).toFixed(1),
      justFrac: totalJust / adjustedTotal,
      unjustPct: ((totalUnjust / adjustedTotal) * 100).toFixed(1),
      unjustFrac: totalUnjust / adjustedTotal,
      noJustPct: ((totalAbsent / adjustedTotal) * 100).toFixed(1),
      noJustFrac: totalAbsent / adjustedTotal,
    };
  }, [partyAttendance]);

  return (
    <div>
      {overall && (
        <StatCards
          cards={[
            {
              label: 'ASISTENCIA PROMEDIO',
              pct: overall.attendPct,
              frac: overall.attendFrac,
              color: C.attendance,
            },
            {
              label: 'FALTAS JUSTIFICADAS',
              pct: overall.justPct,
              frac: overall.justFrac,
              color: C.justified,
            },
            {
              label: 'FALTAS SIN JUSTIFICACIÓN VÁLIDA',
              pct: overall.unjustPct,
              frac: overall.unjustFrac,
              color: C.unjustified,
            },
            {
              label: 'FALTAS SIN JUSTIFICACIÓN',
              pct: overall.noJustPct,
              frac: overall.noJustFrac,
              color: C.noJust,
            },
          ]}
        />
      )}

      <PartyComparisonChart parties={partyAttendance} initialYear={initialYear} />
    </div>
  );
}
