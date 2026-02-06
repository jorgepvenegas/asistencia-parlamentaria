import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPartyColor } from "../constants/colors";

interface PieEntry {
  name: string;
  value: number;
  color: string;
}

interface PartyBreakdownCardProps {
  party: string;
  pieData: PieEntry[];
}

export default function PartyBreakdownCard({ party, pieData }: PartyBreakdownCardProps) {
  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const partyColor = getPartyColor(party);

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-white/[0.06]">
      <div className="flex flex-row items-start gap-4 sm:gap-8">
        {/* Header + Donut */}
        <div className="flex flex-col items-center sm:items-start gap-4 shrink-0">
          <div
            className="border-l-4 pl-3"
            style={{ borderColor: partyColor }}
          >
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {party}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Distribución de días totales
            </p>
          </div>

          <div className="w-[140px] h-[140px] sm:w-[240px] sm:h-[240px]" role="img" aria-label={`Gráfico circular de asistencia para ${party}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  paddingAngle={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) {
                      return null
                    }
                    const d = payload[0].payload as PieEntry;
                    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
                    return (
                      <div className="bg-white dark:bg-[#16162a] border border-slate-200 dark:border-white/[0.06] rounded-lg p-2.5 shadow-lg text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">{d.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">{d.value} ({pct}%)</span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 sm:gap-3 sm:mt-16 min-w-0 sm:min-w-[180px]">
          {pieData.map((d) => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={d.name} className="flex items-center gap-3">
                <span
                  className="w-3 h-8 rounded-sm shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{d.name}</span>
                  <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
                    {d.value}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">
                      ({pct}%)
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
