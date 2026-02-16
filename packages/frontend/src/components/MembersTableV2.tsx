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
        <table className="w-full text-sm border border-[#E5E5E5] dark:border-white/[0.10] rounded-lg overflow-hidden">
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
              const attendColor =
                d.pct >= 75 ? ATTENDANCE_COLORS.attendance : ATTENDANCE_COLORS.noJust;
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
                    <span
                      className="font-[500] text-[13px] font-mono tabular-nums"
                      style={{ color: attendColor }}
                    >
                      {fmt(d, 'pct')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span
                      className="text-[13px] font-mono tabular-nums"
                      style={{ color: ATTENDANCE_COLORS.justified }}
                    >
                      {fmt(d, 'avgValidJust')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span
                      className="text-[13px] font-mono tabular-nums"
                      style={{ color: ATTENDANCE_COLORS.unjustified }}
                    >
                      {fmt(d, 'avgInvalidJust')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: 80 }}>
                    <span
                      className="text-[13px] font-mono tabular-nums"
                      style={{ color: ATTENDANCE_COLORS.noJust }}
                    >
                      {fmt(d, 'avgNoJust')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {sorted.map((d) => {
          const attendColor = d.pct >= 75 ? ATTENDANCE_COLORS.attendance : ATTENDANCE_COLORS.noJust;
          return (
            <div
              key={d.id}
              className="bg-slate-50 dark:bg-white/[0.04] rounded-xl p-4 border border-slate-100 dark:border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                  {formatName(d.name)}
                </span>
                <span
                  className="font-semibold tabular-nums font-mono text-sm"
                  style={{ color: attendColor }}
                >
                  {fmt(d, 'pct')}
                </span>
              </div>
              {/* Stacked bar (always pct-proportional) */}
              <div className="flex h-2 gap-[1px] overflow-hidden rounded-full mb-3">
                <div
                  className="h-full"
                  style={{ width: `${d.pct}%`, background: ATTENDANCE_COLORS.attendance }}
                />
                <div
                  className="h-full"
                  style={{ width: `${d.avgValidJust}%`, background: ATTENDANCE_COLORS.justified }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${d.avgInvalidJust}%`,
                    background: ATTENDANCE_COLORS.unjustified,
                  }}
                />
                <div
                  className="h-full"
                  style={{ width: `${d.avgNoJust}%`, background: ATTENDANCE_COLORS.noJust }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">F. Just.</span>
                  <span
                    className="tabular-nums font-mono font-medium"
                    style={{ color: ATTENDANCE_COLORS.justified }}
                  >
                    {fmt(d, 'avgValidJust')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">F. S/V.</span>
                  <span
                    className="tabular-nums font-mono font-medium"
                    style={{ color: ATTENDANCE_COLORS.unjustified }}
                  >
                    {fmt(d, 'avgInvalidJust')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">F. S/J.</span>
                  <span
                    className="tabular-nums font-mono font-medium"
                    style={{ color: ATTENDANCE_COLORS.noJust }}
                  >
                    {fmt(d, 'avgNoJust')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
