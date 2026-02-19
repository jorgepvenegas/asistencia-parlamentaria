import { useMemo } from 'react';
import type { PoliticianAttendance, PartyAttendance } from '../types/dashboard';
import Navigation from './Navigation';
import SiteFooter from './SiteFooter';
import GeneralAttendance from './GeneralAttendance';

interface LandingPageProps {
  politicians: PoliticianAttendance[];
  partyAttendance: PartyAttendance[];
  initialYear: number;
}

export default function LandingPage({
  politicians,
  partyAttendance,
  initialYear,
}: LandingPageProps) {
  const partyCount = useMemo(() => {
    const names = new Set(politicians.map((p) => p.party));
    return names.size;
  }, [politicians]);

  return (
    <div className="font-display bg-surface text-black m-0 w-full min-h-screen flex flex-col overflow-x-hidden">
      <Navigation />

      <section className="bg-black">
        <div className="max-w-[1536px] mx-auto box-border px-6 pt-6 pb-7 md:px-5 md:pt-10 md:pb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#333] mb-6">
            <span className="bg-brand-green w-2 h-2 rounded-full inline-block" />
            <span className="font-mono text-xs text-muted font-medium">
              Datos actualizados — Periodo {initialYear}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-surface max-w-[700px] mb-6 break-words">
            Quién atendió sesiones del Congreso?
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-[600px] mb-8">
            Conoce quién asiste, quién falta, y por qué. Transparencia para una mejor democracia.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] border-b border-border">
        <div className="max-w-[1536px] mx-auto box-border px-6 py-4 flex gap-12 items-center md:px-5 md:py-4 md:gap-6 md:flex-wrap">
          {[
            { value: politicians.length.toString(), label: 'diputados', highlight: false },
            { value: partyCount.toString(), label: 'partidos políticos', highlight: false },
          ].map(({ value, label, highlight }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`text-xl font-bold tracking-tight ${highlight ? 'text-brand-red' : 'text-black'}`}
              >
                {value}
              </span>
              <span className="font-mono text-xs text-subtle">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <main id="asistencia" className="flex-1">
        <div className="max-w-[1536px] mx-auto box-border px-4 py-6 md:px-5 md:py-8">
          <GeneralAttendance partyAttendance={partyAttendance} initialYear={initialYear} />
        </div>
      </main>

      <SiteFooter year={initialYear} />
    </div>
  );
}
