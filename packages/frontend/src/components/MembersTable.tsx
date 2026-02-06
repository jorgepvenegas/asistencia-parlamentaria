import { useState } from "react";
import type { PoliticianAttendance } from "../types/dashboard";

type SortKey = "name" | "attendance" | "validJust" | "invalidJust" | "noJust" | "pct";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Nombre" },
  { key: "attendance", label: "Asistencia" },
  { key: "validJust", label: "Just. válida" },
  { key: "invalidJust", label: "No justificado" },
  { key: "noJust", label: "Sin just." },
  { key: "pct", label: "% Asist." },
];

interface MembersTableProps {
  members: PoliticianAttendance[];
  party: string;
}

export default function MembersTable({ members, party }: MembersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("pct");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  };

  const sorted = [...members].sort((a, b) => {
    let cmp: number;
    if (sortKey === "name") {
      cmp = a.name.localeCompare(b.name, "es");
    } else {
      cmp = a[sortKey] - b[sortKey];
    }
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-white/[0.06]">
      <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Miembros
      </h3>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Tabla de asistencia de miembros del partido {party}</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left text-slate-500 dark:text-slate-400 font-medium px-4 py-3 text-xs uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-slate-400 dark:text-slate-500">
                        {sortAsc ? "↑" : "↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr
                key={d.id}
                className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{d.name}</td>
                <td className="px-4 py-3 tabular-nums text-slate-900 dark:text-white">{d.attendance}</td>
                <td className="px-4 py-3 tabular-nums text-green-600 dark:text-green-400">{d.validJust}</td>
                <td className="px-4 py-3 tabular-nums text-amber-600 dark:text-amber-400">{d.invalidJust}</td>
                <td className="px-4 py-3 tabular-nums text-red-600 dark:text-red-400">{d.noJust}</td>
                <td className="px-4 py-3 tabular-nums font-semibold text-slate-900 dark:text-white">{d.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {sorted.map((d) => (
          <div
            key={d.id}
            className="bg-slate-50 dark:bg-white/[0.04] rounded-xl p-4 border border-slate-100 dark:border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{d.name}</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{d.pct}%</span>
            </div>
            {/* Attendance mini bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${d.pct}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Asistencia</span>
                <span className="tabular-nums font-medium text-slate-700 dark:text-slate-200">{d.attendance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Just. válida</span>
                <span className="tabular-nums font-medium text-green-600 dark:text-green-400">{d.validJust}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">No justif.</span>
                <span className="tabular-nums font-medium text-amber-600 dark:text-amber-400">{d.invalidJust}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sin just.</span>
                <span className="tabular-nums font-medium text-red-600 dark:text-red-400">{d.noJust}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
