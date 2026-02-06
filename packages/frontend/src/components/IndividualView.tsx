import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PoliticianAttendance } from "../types/dashboard";
import { getPartyColor } from "../constants/colors";

interface PartyInfo {
  party: string;
}

interface IndividualViewProps {
  data: PoliticianAttendance[];
  parties: PartyInfo[];
  selectedParty: string | null;
  onSelectParty: (party: string | null) => void;
  sortBy: "pct" | "attendance";
  onSortChange: (sort: "pct" | "attendance") => void;
}

export default function IndividualView({
  data,
  parties,
  selectedParty,
  onSelectParty,
  sortBy,
  onSortChange,
}: IndividualViewProps) {
  const chartHeight = Math.max(300, data.length * 30);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Ordenar por:
        </span>
        {([
          ["pct", "% Asistencia"],
          ["attendance", "Días asistidos"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className={`
              text-sm px-4 py-2 rounded-lg border transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
              ${sortBy === key
                ? "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white font-medium shadow-sm"
                : "border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              }
            `}
          >
            {label}
          </button>
        ))}

        <div className="ml-auto">
          <select
            value={selectedParty || ""}
            onChange={(e) => onSelectParty(e.target.value || null)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.05] text-slate-900 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            <option value="">Todos los partidos</option>
            {parties.map((p) => (
              <option key={p.party} value={p.party}>
                {p.party}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white dark:bg-[#16162a] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-white/[0.06]">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">
          Asistencia por Diputado/a
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Porcentaje de asistencia individual
        </p>

        <div role="img" aria-label="Gráfico de barras horizontales mostrando asistencia individual">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[80, 100]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v + "%"}
                className="[&_text]:fill-slate-500 dark:[&_text]:fill-slate-400"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={(props: { x: number; y: number; payload: { value: string } }) => {
                  const { x, y, payload } = props;
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      className="text-[10px] sm:text-xs fill-slate-500 dark:fill-slate-400"
                    >
                      {payload.value.length > 24
                        ? payload.value.slice(0, 22) + "…"
                        : payload.value}
                    </text>
                  );
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) {
                    return null;
                  }
                  const d = payload[0].payload as PoliticianAttendance;
                  return (
                    <div className="bg-white dark:bg-[#16162a] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 shadow-lg text-sm">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{d.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">{d.party}</div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-green-600 dark:text-green-400">Asist: {d.attendance}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{d.pct}%</span>
                      </div>
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="pct" radius={[0, 5, 5, 0]} barSize={16}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={getPartyColor(entry.party)}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] justify-center">
          {[...new Set(data.map((d) => d.party))].map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: getPartyColor(p) }}
              />
              {p.replace("Partido ", "")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
