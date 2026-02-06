import { useState, useMemo, useEffect } from "react";
import type { DashboardProps, PoliticianAttendance } from "../types/dashboard";
import PartyPills from "./PartyPills";
import PartyStackedBars from "./PartyStackedBars";
import PartyBreakdownCard from "./PartyBreakdownCard";
import MembersTable from "./MembersTable";
import IndividualView from "./IndividualView";

export default function Dashboard({
  politicians,
  partyAttendance,
  initialYear,
}: DashboardProps) {
  const [isDark, setIsDark] = useState(true);
  const [view, setView] = useState<"party" | "individual">("party");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"pct" | "attendance">("pct");

  // Sync dark class on <html>
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  // Data computations
  const membersByPartyId = useMemo(() => {
    const map: Record<number, PoliticianAttendance[]> = {};
    politicians.forEach((d) => {
      if (!map[d.partyId]) map[d.partyId] = [];
      map[d.partyId].push(d);
    });
    return map;
  }, [politicians]);

  const partyAggregates = useMemo(() => {
    return partyAttendance
      .map((p) => ({
        party: p.partyName,
        members: membersByPartyId[p.partyId] || [],
        totalAttendance: p.attendanceCount,
        totalValid: p.justifiedAbsentCount,
        totalInvalid: p.unjustifiedAbsentCount,
        totalNoJust: Math.max(0, p.absentCount - p.justifiedAbsentCount),
        avgPct: parseFloat(p.attendanceAverage.toFixed(1)),
        count: (membersByPartyId[p.partyId] || []).length,
      }))
      .sort((a, b) => b.avgPct - a.avgPct);
  }, [partyAttendance, membersByPartyId]);

  const individualData = useMemo(() => {
    const filtered = selectedParty
      ? politicians.filter((d) => d.party === selectedParty)
      : politicians;
    return [...filtered].sort((a, b) =>
      sortBy === "pct" ? b.pct - a.pct : b.attendance - a.attendance
    );
  }, [selectedParty, sortBy, politicians]);

  const pieData = useMemo(() => {
    if (!selectedParty) return [];
    const p = partyAggregates.find((p) => p.party === selectedParty);
    if (!p) return [];
    return [
      { name: "Asistencia", value: p.totalAttendance, color: "#22c55e" },
      { name: "Justificado", value: p.totalValid, color: "#f59e0b" },
      { name: "No justificado", value: p.totalInvalid, color: "#ef4444" },
      { name: "Sin justificación", value: p.totalNoJust, color: "#991b1b" },
    ];
  }, [selectedParty, partyAggregates]);

  const selectedPartyMembers = useMemo(() => {
    if (!selectedParty) return [];
    return individualData;
  }, [selectedParty, individualData]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700/50 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                QuienAtiende
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Asistencia a Sesiones de Sala · Cámara de Diputados
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {([
            ["party", "Por Partido"],
            ["individual", "Por Diputado/a"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`
                px-4 py-2.5 rounded-md text-sm font-medium transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
                ${view === key
                  ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Party View */}
        {view === "party" && (
          <div className="space-y-6">
            <PartyPills
              parties={partyAggregates.map((p) => ({ party: p.party, count: p.count }))}
              selectedParty={selectedParty}
              onSelect={setSelectedParty}
            />

            <PartyStackedBars
              data={partyAggregates}
              selectedParty={selectedParty}
              onSelectParty={setSelectedParty}
            />

            {selectedParty && pieData.length > 0 && (
              <PartyBreakdownCard party={selectedParty} pieData={pieData} />
            )}

            {selectedParty && selectedPartyMembers.length > 0 && (
              <MembersTable members={selectedPartyMembers} party={selectedParty} />
            )}
          </div>
        )}

        {/* Individual View */}
        {view === "individual" && (
          <IndividualView
            data={individualData}
            parties={partyAggregates.map((p) => ({ party: p.party }))}
            selectedParty={selectedParty}
            onSelectParty={setSelectedParty}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-white/[0.04] space-y-1">
          <p>Datos extraídos de la Cámara de Diputados · {initialYear}</p>
          <p>
            <a
              href="https://github.com/jorgepvenegas/asistencia-camara-charts"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              Código fuente
            </a>
            {" · Fuente: "}
            <a
              href="https://www.camara.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              camara.cl
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
