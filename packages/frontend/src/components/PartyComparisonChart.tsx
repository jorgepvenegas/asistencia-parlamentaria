import { useMemo, useState } from 'react';
import { ATTENDANCE_COLORS, getPartyColor } from '../constants/colors';
import { useIsMobile } from '../hooks/useIsMobile';
import { toPartySlug } from '../utils/partySlug';
import AttendanceLegend from './AttendanceLegend';
import HoverTooltip from './HoverTooltip';

const MOBILE_PREVIEW = 7;

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
  memberCount: number;
}

interface PartyComparisonChartProps {
  parties: Party[];
  initialYear: number;
}

function partySegments(p: Party) {
  const total =
    p.attendanceCount + p.absentCount + p.justifiedAbsentCount + p.unjustifiedAbsentCount;
  if (total === 0) {
    return { a: 0, b: 0, c: 0, d: 0 };
  }
  return {
    a: (p.attendanceCount / total) * 100,
    b: (p.justifiedAbsentCount / total) * 100,
    c: (p.unjustifiedAbsentCount / total) * 100,
    d: (p.absentCount / total) * 100,
  };
}

const C = ATTENDANCE_COLORS;

const TOOLTIP_ROWS: { label: string; key: keyof Party; color: string }[] = [
  { label: 'Asistencia', key: 'attendanceCount', color: C.attendance },
  { label: 'Falta justificada', key: 'justifiedAbsentCount', color: C.justified },
  { label: 'Falta sin just. válida', key: 'unjustifiedAbsentCount', color: C.unjustified },
  { label: 'Falta sin justificación', key: 'absentCount', color: C.noJust },
];

export default function PartyComparisonChart({ parties, initialYear }: PartyComparisonChartProps) {
  const isMobile = useIsMobile();
  const [tooltip, setTooltip] = useState<{ party: Party; x: number; y: number } | null>(null);
  const [asc, setAsc] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const partiesSorted = useMemo(() => {
    const attendancePct = (p: Party) => {
      const total =
        p.attendanceCount + p.absentCount + p.justifiedAbsentCount + p.unjustifiedAbsentCount;
      return total === 0 ? 0 : p.attendanceCount / total;
    };
    return [...parties].sort((a, b) =>
      asc ? attendancePct(a) - attendancePct(b) : attendancePct(b) - attendancePct(a)
    );
  }, [parties, asc]);

  const visibleParties = useMemo(() => {
    if (!isMobile || expanded) {
      return partiesSorted;
    }
    return partiesSorted.slice(0, MOBILE_PREVIEW);
  }, [isMobile, expanded, partiesSorted]);

  return (
    <>
      <AttendanceLegend />
      <div className="flex flex-row-reverse">
        <button
          onClick={() => setAsc((v) => !v)}
          className="flex items-center gap-1 shrink-0 border border-border bg-transparent cursor-pointer px-2.5 py-1.5 font-mono text-xs font-medium text-subtle"
        >
          {asc ? '↑ Menor a mayor' : '↓ Mayor a menor'}
        </button>
      </div>
      <div className="border rounded-xl flex flex-col md:p-5 ">
        {visibleParties.map((party) => {
          const seg = partySegments(party);
          const partySlug = toPartySlug(party.partyName) || String(party.partyId);
          return (
            <a
              key={party.partyId}
              href={`/partidos/${partySlug}/${initialYear}`}
              className="md:flex md:flex-row md:items-center gap-3 cursor-pointer no-underline text-inherit px-4 py-3 md:px-0 border-b border-border last:border-b-0 md:border-b-0"
              aria-label={`Ver detalle del partido ${party.partyName}`}
              onMouseMove={(e) => {
                setTooltip({ party, x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                setTooltip(null);
              }}
            >
              {/* Desktop: Party name (left) */}
              {/* Mobile: Hidden (shown in row below) */}
              <span
                className="hidden md:inline-flex items-center gap-2 text-xs font-medium text-black overflow-hidden text-ellipsis whitespace-nowrap w-[230px] shrink-0"
                title={party.partyName}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getPartyColor(party.partyName) }}
                />
                <span className="overflow-hidden text-ellipsis">
                  {party.partyName}
                  <span className="text-muted ml-1">→</span>
                </span>
              </span>

              {/* Mobile: Row 1 - Party name + percentage */}
              <div className="flex md:hidden justify-between items-center w-full pb-2">
                <span
                  className="text-xs font-medium text-black overflow-hidden text-ellipsis whitespace-nowrap inline-flex items-center gap-1.5"
                  title={party.partyName}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getPartyColor(party.partyName) }}
                  />
                  {party.partyName}
                  <span className="text-muted shrink-0">→</span>
                </span>
                <span className="font-mono text-xs font-semibold">{seg.a.toFixed(1)}%</span>
              </div>

              {/* Bar - Desktop: middle, Mobile: row 2 */}
              <div className="w-full h-2 md:flex-1 md:h-5 md:overflow-hidden flex gap-px">
                <div style={{ flex: seg.a, background: C.attendance, height: '100%' }} />
                <div style={{ flex: seg.b, background: C.justified, height: '100%' }} />
                <div style={{ flex: seg.c, background: C.unjustified, height: '100%' }} />
                <div style={{ flex: seg.d, background: C.noJust, height: '100%' }} />
              </div>

              {/* Desktop: Percentage (right) */}
              <span className="hidden md:inline font-mono text-xs font-medium w-[50px] shrink-0 text-right">
                {seg.a.toFixed(1)}%
              </span>
            </a>
          );
        })}
        {isMobile && !expanded && partiesSorted.length > MOBILE_PREVIEW && (
          <button
            onClick={() => setExpanded(true)}
            className="flex md:hidden items-center justify-center py-3.5 px-4 bg-transparent border-0 border-t border-border cursor-pointer font-mono text-xs font-semibold text-black w-full"
          >
            Ver todos ({partiesSorted.length - MOBILE_PREVIEW} más)
          </button>
        )}
      </div>

      {tooltip && (
        <HoverTooltip
          x={tooltip.x}
          y={tooltip.y}
          title={tooltip.party.partyName}
          subheader={`${tooltip.party.memberCount} miembros`}
          rows={[
            ...TOOLTIP_ROWS.map(({ label, key, color }) => ({
              label,
              color,
              value: `${tooltip.party[key] as number} días`,
            })),
          ]}
        />
      )}
    </>
  );
}
