import { useState, useEffect } from 'react';
import type { PoliticianAttendance } from '../types/dashboard';
import { ATTENDANCE_COLORS, getPartyColor } from '../constants/colors';
import { formatName } from '@/utils/formatName';

type SortKey = 'name' | 'pct' | 'avgValidJust' | 'avgInvalidJust' | 'avgNoJust';

const COUNT_KEY: Record<Exclude<SortKey, 'name'>, keyof PoliticianAttendance> = {
  pct: 'attendanceCount',
  avgValidJust: 'justifiedAbsentCount',
  avgInvalidJust: 'unjustifiedAbsentCount',
  avgNoJust: 'absentCount',
};

const COLUMNS: { key: SortKey; label: string; shortLabel: string }[] = [
  { key: 'name', label: 'DIPUTADO/A', shortLabel: '' },
  { key: 'pct', label: 'ASISTENCIA', shortLabel: '' },
  { key: 'avgValidJust', label: 'CON JUSTIFICACIÓN VÁLIDA', shortLabel: 'AUSENTE' },
  { key: 'avgInvalidJust', label: 'CON JUSTIFICACIÓN INVÁLIDA', shortLabel: '' },
  { key: 'avgNoJust', label: 'SIN JUSTIFICACIÓN', shortLabel: '' },
];

interface MembersTableV2Props {
  members: PoliticianAttendance[];
  party: string;
  showPct?: boolean;
  onQueryChange?: (queryString: string) => void;
}

export default function MembersTableV2({
  members,
  party,
  showPct = true,
  onQueryChange,
}: MembersTableV2Props) {
  const [sortKey, setSortKey] = useState<SortKey>('pct');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Read initial state from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlSort = params.get('sort') as SortKey | null;
    const urlDir = params.get('dir');
    const urlSearch = params.get('search') || '';

    if (urlSort && COLUMNS.some((c) => c.key === urlSort)) {
      setSortKey(urlSort);
    }
    if (urlDir === 'asc' || urlDir === 'desc') {
      setSortAsc(urlDir === 'asc');
    }
    setSearchQuery(urlSearch);
    setIsInitialized(true);
  }, []);

  // Update URL when state changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (sortKey !== 'pct') params.set('sort', sortKey);
    if (sortAsc) params.set('dir', 'asc');
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
    onQueryChange?.(queryString);
  }, [sortKey, sortAsc, searchQuery, isInitialized, onQueryChange]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === 'name');
    }
  };

  const filtered = searchQuery.trim()
    ? members.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : members;

  const sorted = [...filtered].sort((a, b) => {
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
    <div className="w-full">
      {/* Search */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full sm:w-80 px-4 py-2 border border-[#E5E5E5] dark:border-white/[0.10] bg-transparent text-sm text-black dark:text-white placeholder:text-[#999] rounded-lg focus:outline-none focus:border-[#999] focus:ring-1 focus:ring-[#999]/20"
        />
        {searchQuery && (
          <>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-[#5E5E5E] hover:text-black dark:hover:text-white underline cursor-pointer"
            >
              Limpiar filtro
            </button>
            <span className="text-xs text-[#5E5E5E]">
              {filtered.length} de {members.length} resultados
            </span>
          </>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table
          className="w-full text-sm border border-[#E5E5E5] dark:border-white/[0.10] rounded-lg overflow-hidden"
          style={{ tableLayout: 'fixed' }}
        >
          <caption className="sr-only">Tabla de asistencia de miembros del partido {party}</caption>
          <thead>
            {/* Top header row - Group labels */}
            <tr className="bg-[#F5F5F5] dark:bg-white/[0.04] border-b border-[#E5E5E5] dark:border-white/[0.06]">
              <th className="text-left px-5 py-2" style={{ width: '30%' }} rowSpan={2}>
                <span className="inline-flex items-center gap-1 font-[600] text-[11px] text-black dark:text-white tracking-[1px] font-mono">
                  {COLUMNS[0].label}
                  {sortKey === 'name' && <span className="opacity-50">{sortAsc ? '↑' : '↓'}</span>}
                </span>
              </th>
              <th
                className="text-left px-5 py-2 cursor-pointer select-none hover:bg-[#EBEBEB] dark:hover:bg-white/[0.06] transition-colors"
                style={{ width: '15%' }}
                rowSpan={2}
                onClick={() => handleSort('pct')}
                aria-sort={sortKey === 'pct' ? (sortAsc ? 'ascending' : 'descending') : undefined}
              >
                <span className="inline-flex items-center gap-1 font-[600] text-[11px] text-black dark:text-white tracking-[1px] font-mono">
                  {COLUMNS[1].label}
                  {sortKey === 'pct' && <span className="opacity-50">{sortAsc ? '↑' : '↓'}</span>}
                </span>
              </th>
              <th
                className="text-center px-5 py-2 border-b border-[#E5E5E5] dark:border-white/[0.10]"
                colSpan={3}
              >
                <span className="font-[600] text-[11px] text-black dark:text-white tracking-[1px] font-mono">
                  AUSENTE
                </span>
              </th>
            </tr>
            {/* Bottom header row - Sub labels */}
            <tr className="bg-[#F5F5F5] dark:bg-white/[0.04] border-b border-[#E5E5E5] dark:border-white/[0.10]">
              {COLUMNS.slice(2).map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  aria-sort={
                    sortKey === col.key ? (sortAsc ? 'ascending' : 'descending') : undefined
                  }
                  className="text-left px-5 py-2 cursor-pointer select-none hover:bg-[#EBEBEB] dark:hover:bg-white/[0.06] transition-colors"
                  style={{ width: '18.33%' }}
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
            {sorted.map((d, i) => {
              const pctValue = showPct ? (d.pct as number) : null;
              return (
                <tr
                  key={d.id}
                  className={`border-b border-[#E5E5E5] dark:border-white/[0.06] hover:bg-blue-50/50 dark:hover:bg-white/[0.03] transition-colors ${i % 2 === 1 ? 'bg-[#FAFAFA] dark:bg-white/[0.02]' : ''}`}
                >
                  <td className="px-5 py-3.5" style={{ width: '30%' }}>
                    <span className="inline-flex items-center gap-2 font-[500] text-[13px] text-black dark:text-white font-[Sora,sans-serif]">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: getPartyColor(d.party) }}
                      />
                      {formatName(d.name)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: '15%' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-[500] text-[13px] font-mono tabular-nums text-black dark:text-white">
                        {fmt(d, 'pct')}
                      </span>
                      {pctValue !== null && (
                        <div className="hidden lg:block w-12 h-1.5 rounded-full bg-border/50 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pctValue}%`,
                              backgroundColor:
                                pctValue >= 90
                                  ? ATTENDANCE_COLORS.attendance
                                  : pctValue >= 80
                                    ? ATTENDANCE_COLORS.justified
                                    : ATTENDANCE_COLORS.unjustified,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: '18.33%' }}>
                    <span className="text-[13px] font-mono tabular-nums text-black dark:text-white">
                      {fmt(d, 'avgValidJust')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: '18.33%' }}>
                    <span className="text-[13px] font-mono tabular-nums text-black dark:text-white">
                      {fmt(d, 'avgInvalidJust')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ width: '18.33%' }}>
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
      <div className="sm:hidden border border-[#E5E7EB] dark:border-white/[0.06] rounded-lg overflow-hidden">
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
        {sorted.map((d, i) => (
          <div
            key={d.id}
            className={`border-b border-[#F3F4F6] dark:border-white/[0.06] last:border-b-0 ${i % 2 === 1 ? 'bg-[#FAFAFA] dark:bg-white/[0.02]' : ''}`}
            style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 12px' }}
          >
            <div
              style={{
                flex: 1,
                paddingLeft: 4,
                paddingRight: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: getPartyColor(d.party),
                  flexShrink: 0,
                }}
              />
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
