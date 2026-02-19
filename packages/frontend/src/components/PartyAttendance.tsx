import { useState, useMemo } from 'react';
import type { PartyAttendanceProps, PoliticianAttendance } from '../types/dashboard';
import type { PartyAttendance as PartyAttendanceType } from '../types/dashboard';
import { ATTENDANCE_COLORS } from '../constants/colors';
import AttendanceLegend from './AttendanceLegend';
import StatCards from './StatCards';
import DistributionBar from './DistributionBar';

const C = ATTENDANCE_COLORS;

function politicianBarSegments(p: PoliticianAttendance) {
  const total =
    p.attendanceCount + p.justifiedAbsentCount + p.unjustifiedAbsentCount + p.absentCount;
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

function partyStatCards(party: PartyAttendanceType) {
  const adjustedTotal =
    party.attendanceCount +
    party.justifiedAbsentCount +
    party.unjustifiedAbsentCount +
    party.absentCount;
  if (adjustedTotal === 0) {
    return null;
  }
  return [
    {
      label: 'DÍAS ASISTIDOS',
      pct: party.avgAttendance.toFixed(1),
      frac: party.avgAttendance / 100,
      color: C.attendance,
    },
    {
      label: 'FALTAS JUSTIFICADAS',
      pct: party.avgValidJust.toFixed(1),
      frac: party.avgValidJust / 100,
      color: C.justified,
    },
    {
      label: 'FALTAS SIN JUSTIFICACIÓN VÁLIDA',
      pct: party.avgInvalidJust.toFixed(1),
      frac: party.avgInvalidJust / 100,
      color: C.unjustified,
    },
    {
      label: 'FALTAS SIN JUSTIFICACIÓN',
      pct: party.avgNoJust.toFixed(1),
      frac: party.avgNoJust / 100,
      color: C.noJust,
    },
  ];
}

const PER_PAGE = 10;

export default function PartyAttendance({
  politicians,
  partyAttendance,
  initialYear,
}: PartyAttendanceProps) {
  const membersByParty = useMemo(() => {
    const map: Record<string, PoliticianAttendance[]> = {};
    politicians.forEach((p) => {
      if (!map[p.party]) {
        map[p.party] = [];
      }
      map[p.party].push(p);
    });
    return map;
  }, [politicians]);

  const sortedParties = useMemo(
    () =>
      [...partyAttendance].sort(
        (a, b) =>
          (membersByParty[b.partyName] || []).length - (membersByParty[a.partyName] || []).length
      ),
    [partyAttendance, membersByParty]
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(1);

  const selectedParty = sortedParties[selectedIdx];
  const members: PoliticianAttendance[] = selectedParty
    ? membersByParty[selectedParty.partyName] || []
    : [];
  const totalPages = Math.ceil(members.length / PER_PAGE);
  const pageMembers = members.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const statCards = selectedParty ? partyStatCards(selectedParty) : null;

  function selectParty(i: number) {
    setSelectedIdx(i);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-semibold tracking-tight text-black mb-2">
            Asistencia por partido
          </h2>
          <p className="text-sm text-subtle m-0">
            Selecciona un partido para ver la asistencia desglosada de cada congresista
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 border border-border">
          <span className="text-xs font-medium">{initialYear}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {sortedParties.map((party, i) => (
          <button
            key={party.partyId}
            onClick={() => selectParty(i)}
            className={`flex items-center gap-2 px-5 py-2.5 cursor-pointer font-display text-xs font-medium ${
              i === selectedIdx
                ? 'bg-black text-surface border-0 font-semibold'
                : 'bg-transparent text-subtle border border-border'
            }`}
          >
            {party.partyName}
            <span className="font-mono text-xs text-muted">
              {(membersByParty[party.partyName] || []).length}
            </span>
          </button>
        ))}
      </div>

      {statCards && <StatCards cards={statCards} />}

      <AttendanceLegend />

      <div className="border border-border">
        <div className="flex items-center bg-[#F5F5F5] px-5 py-3.5 border-b border-border">
          <div className="w-[220px] shrink-0">
            <span className="font-mono text-xs font-semibold tracking-wide">CONGRESISTA</span>
          </div>
          <div className="w-20 shrink-0">
            <span className="font-mono text-xs font-semibold tracking-wide">ASIST.</span>
          </div>
          <div className="w-20 shrink-0">
            <span className="font-mono text-xs font-semibold tracking-wide">F. JUST.</span>
          </div>
          <div className="w-20 shrink-0">
            <span className="font-mono text-xs font-semibold tracking-wide">F. S/V.</span>
          </div>
          <div className="w-20 shrink-0">
            <span className="font-mono text-xs font-semibold tracking-wide">F. S/J.</span>
          </div>
          <div className="flex-1">
            <span className="font-mono text-xs font-semibold tracking-wide">DISTRIBUCIÓN</span>
          </div>
        </div>

        {pageMembers.map((p) => {
          const seg = politicianBarSegments(p);
          const attendColor = p.pct >= 80 ? C.attendance : p.pct >= 60 ? C.unjustified : C.noJust;
          return (
            <div key={p.id} className="flex items-center px-5 py-3.5 border-b border-border">
              <div className="w-[220px] shrink-0">
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <div className="w-20 shrink-0">
                <span className="font-mono text-sm font-medium" style={{ color: attendColor }}>
                  {p.pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-20 shrink-0">
                <span className="font-mono text-sm" style={{ color: C.justified }}>
                  {seg.b.toFixed(1)}%
                </span>
              </div>
              <div className="w-20 shrink-0">
                <span className="font-mono text-sm" style={{ color: C.unjustified }}>
                  {seg.c.toFixed(1)}%
                </span>
              </div>
              <div className="w-20 shrink-0">
                <span className="font-mono text-sm" style={{ color: C.noJust }}>
                  {seg.d.toFixed(1)}%
                </span>
              </div>
              <DistributionBar a={seg.a} b={seg.b} c={seg.c} d={seg.d} />
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span className="font-mono text-xs text-muted">
            Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, members.length)} de{' '}
            {members.length} congresistas
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 flex items-center justify-center font-display text-xs cursor-pointer ${
                  i + 1 === page
                    ? 'bg-black text-surface border-0 font-semibold'
                    : 'bg-transparent text-subtle border border-border font-medium'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
