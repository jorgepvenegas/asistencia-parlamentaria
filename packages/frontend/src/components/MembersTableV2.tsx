import { useState } from 'react';
import type { PoliticianAttendance } from '../types/dashboard';
import { ATTENDANCE_COLORS } from '../constants/colors';
import { formatName } from '@/utils/formatName';

type SortKey = 'name' | 'pct' | 'avgValidJust' | 'avgInvalidJust' | 'avgNoJust';

const COUNT_KEY: Record<Exclude<SortKey, 'name'>, keyof PoliticianAttendance> = {
  pct: 'attendanceCount',
  avgValidJust: 'justifiedAbsentCount',
  avgInvalidJust: 'unjustifiedAbsentCount',
  avgNoJust: 'absentCount',
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'DIPUTADO/A' },
  { key: 'pct', label: 'ASISTENCIA' },
  { key: 'avgValidJust', label: 'AUSENTE CON JUSTIFICACION VALIDA' },
  { key: 'avgInvalidJust', label: 'AUSENTE CON JUSTIFICACION INVALIDA' },
  { key: 'avgNoJust', label: 'AUSENTE SIN JUSTIFICACION' },
];

interface MembersTableV2Props {
  members: PoliticianAttendance[];
  party: string;
  showPct?: boolean;
}

export default function MembersTableV2({ members, party, showPct = true }: MembersTableV2Props) {
  const [sortKey, setSortKey] = useState<SortKey>('pct');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const sorted = [...members].sort((a, b) => {
    let cmp: number;
    if (sortKey === 'name') {
      cmp = a.name.localeCompare(b.name, 'es');
    } else {
      const field = showPct ? sortKey : COUNT_KEY[sortKey];
      cmp = (a[field] as number) - (b[field] as number);
    }
    return sortAsc ? cmp : -cmp;
  });

  const fmt = (d: PoliticianAttendance, key: Exclude<SortKey, 'name'>) =>
    showPct ? `${(d[key] as number).toFixed(1)}%` : String(d[COUNT_KEY[key]] as number);

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border border-[#E5E5E5] dark:border-white/[0.10] overflow-hidden">
          <caption className="sr-only">Tabla de asistencia de miembros del partido {party}</caption>
          <thead>
            <tr className="bg-[#F5F5F5] dark:bg-white/[0.04] border-b border-[#E5E5E5] dark:border-white/[0.10]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  aria-sort={
                    sortKey === col.key ? (sortAsc ? 'ascending' : 'descending') : undefined
                  }
                  className="text-left px-5 py-3.5 cursor-pointer select-none hover:bg-[#EBEBEB] dark:hover:bg-white/[0.06] transition-colors"
                  style={{ width: col.key === 'name' ? 220 : 80 }}
                >
                  <span className="inline-flex items-center gap-1 font-[600] text-[11px] text-black dark:text-white tracking-[1px] font-mono">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="opacity-50">{sortAsc ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              return (
                <tr
                  key={d.id}
                  className="border-b border-[#E5E5E5] dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-5 py-3.5" style={{ width: 220 }}>
                    <span className="font-[500] text-[13px] text-black dark:text-white font-[Sora,sans-serif]">
                      {formatName(d.name)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span className="font-[500] text-[13px] font-mono tabular-nums text-black dark:text-white">
                      {fmt(d, 'pct')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span className="text-[13px] font-mono tabular-nums text-black dark:text-white">
                      {fmt(d, 'avgValidJust')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span className="text-[13px] font-mono tabular-nums text-black dark:text-white">
                      {fmt(d, 'avgInvalidJust')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span className="text-[13px] font-mono tabular-nums text-black dark:text-white">
                      {fmt(d, 'avgNoJust')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Table */}
      <div className="sm:hidden border border-[#E5E7EB] dark:border-white/[0.06] overflow-hidden">
        {/* Header */}
        <div
          className="dark:bg-white/[0.04] dark:border-white/[0.10]"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 36,
            padding: '0 12px',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div
            style={{
              flex: 1,
              paddingLeft: 4,
              paddingRight: 4,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: '#6B7280',
              }}
            >
              Nombre
            </span>
          </div>
          {[
            { label: 'P', color: ATTENDANCE_COLORS.attendance },
            { label: 'L', color: ATTENDANCE_COLORS.justified },
            { label: 'T', color: ATTENDANCE_COLORS.unjustified },
            { label: 'F', color: ATTENDANCE_COLORS.noJust },
          ].map(({ label, color }, i) => (
            <div
              key={label}
              style={{
                width: i === 3 ? 36 : 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        {/* Rows */}
        {sorted.map((d) => (
          <div
            key={d.id}
            className="border-b border-[#F3F4F6] dark:border-white/[0.06] last:border-b-0"
            style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 12px' }}
          >
            <div
              style={{
                flex: 1,
                paddingLeft: 4,
                paddingRight: 4,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                className="dark:text-white"
              >
                {formatName(d.name)}
              </span>
            </div>
            {(['pct', 'avgValidJust', 'avgInvalidJust', 'avgNoJust'] as const).map((key, i) => (
              <div
                key={key}
                style={{
                  width: i === 3 ? 36 : 40,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: '#374151',
                  }}
                  className="dark:text-slate-300 tabular-nums"
                >
                  {fmt(d, key)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
