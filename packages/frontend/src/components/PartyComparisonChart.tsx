import { useMemo, useState } from 'react';
import { ATTENDANCE_COLORS } from '../constants/colors';
import { useIsMobile } from '../hooks/useIsMobile';
import { toPartySlug } from '../utils/partySlug';
import AttendanceLegend from './AttendanceLegend';
import HoverTooltip from './HoverTooltip';
import SectionHeader from './SectionHeader';

const MOBILE_PREVIEW = 7;

const CHART_RESPONSIVE = `
  .chart-party-name { width: 230px; flex-shrink: 0; }
  .chart-row-bar  { flex: 1; display: flex; height: 20px; overflow: hidden; }
  .chart-row-pct  { width: 50px; flex-shrink: 0; text-align: right; }
  .chart-container { padding: 24px; }
  .chart-expand-btn { display: none; }
  @media (max-width: 767px) {
    .chart-container { padding: 0 !important; }
    .chart-row { flex-wrap: wrap; gap: 0 !important; padding: 14px 16px; border-bottom: 1px solid #E5E5E5; }
    .chart-row:last-child { border-bottom: none; }
    .chart-party-name { order: 1; flex: 1; width: auto !important; font-size: 13px !important; }
    .chart-row-pct  { order: 2; width: auto !important; color: #22C55E; font-size: 13px !important; font-weight: 600 !important; }
    .chart-row-bar  { order: 3; width: 100%; flex: none; height: 8px; margin-top: 10px; gap: 1px; }
    .chart-expand-btn { display: flex; }
  }
`;

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
      <style>{CHART_RESPONSIVE}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <SectionHeader
          title="Asistencia por partidos"
          description="Distribución de asistencias y faltas por partido. Porcentajes sobre el total de sesiones registradas."
        />
        <button
          onClick={() => setAsc((v) => !v)}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: '1px solid #E5E5E5',
            background: 'none',
            cursor: 'pointer',
            padding: '6px 10px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            color: '#5E5E5E',
          }}
        >
          {asc ? '↑ Menor a mayor' : '↓ Mayor a menor'}
        </button>
      </div>
      <AttendanceLegend />
      <div
        className="chart-container"
        style={{
          border: '1px solid #E5E5E5',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {visibleParties.map((party) => {
          const seg = partySegments(party);
          const partySlug = toPartySlug(party.partyName) || String(party.partyId);
          return (
            <a
              key={party.partyId}
              href={`/${initialYear}/${partySlug}`}
              className="chart-row"
              aria-label={`Ver detalle del partido ${party.partyName}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseMove={(e) => {
                setTooltip({ party, x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                setTooltip(null);
              }}
            >
              <span
                className="chart-party-name"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#000',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title={party.partyName}
              >
                {party.partyName}
                <span style={{ color: '#999', flexShrink: 0 }}>→</span>
              </span>
              <div className="chart-row-bar">
                <div style={{ flex: seg.a, background: C.attendance, height: '100%' }} />
                <div style={{ flex: seg.b, background: C.justified, height: '100%' }} />
                <div style={{ flex: seg.c, background: C.unjustified, height: '100%' }} />
                <div style={{ flex: seg.d, background: C.noJust, height: '100%' }} />
              </div>
              <span
                className="chart-row-pct"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {seg.a.toFixed(1)}%
              </span>
            </a>
          );
        })}
        {isMobile && !expanded && partiesSorted.length > MOBILE_PREVIEW && (
          <button
            className="chart-expand-btn"
            onClick={() => setExpanded(true)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderTop: '1px solid #E5E5E5',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              color: '#000',
              width: '100%',
            }}
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
