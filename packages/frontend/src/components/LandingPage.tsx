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

      <section className="bg-gradient-to-br from-black via-black to-[#1a1a2e] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(220,38,38,0.08),transparent_50%)]" />
        <div className="max-w-[1536px] mx-auto box-border px-6 pt-8 pb-10 md:px-5 md:pt-14 md:pb-8 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#333] rounded-full mb-6">
            <span className="bg-brand-green w-2 h-2 rounded-full inline-block animate-pulse" />
            <span className="font-mono text-xs text-muted font-medium">
              Datos actualizados — Periodo {initialYear}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-surface max-w-[700px] mb-6 break-words">
            Quién atendió sesiones del Congreso?
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed max-w-[600px] mb-8">
            Conoce quién asiste, quién falta, y por qué. Transparencia para una mejor democracia.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F5F5] border-b border-border">
        <div className="max-w-[1536px] mx-auto box-border px-6 py-5 flex gap-10 items-center md:px-5 md:py-5 md:gap-8 md:flex-wrap">
          {[
            { value: politicians.length.toString(), label: 'diputados' },
            { value: partyCount.toString(), label: 'partidos políticos' },
          ].map(({ value, label }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-black">{value}</span>
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
