import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

interface PartyAggregate {
  party: string;
  totalAttendance: number;
  totalValid: number;
  totalInvalid: number;
  totalNoJust: number;
  avgPct: number;
  count: number;
}

interface PartyStackedBarsProps {
  data: PartyAggregate[];
  selectedParty: string | null;
  onSelectParty: (party: string | null) => void;
}

const CATEGORIES = [
  { key: "pctAttendance", rawKey: "totalAttendance", name: "Asistencia", color: "#22c55e" },
  { key: "pctValid", rawKey: "totalValid", name: "Justificado", color: "#f59e0b" },
  { key: "pctInvalid", rawKey: "totalInvalid", name: "No justificado", color: "#ef4444" },
  { key: "pctNoJust", rawKey: "totalNoJust", name: "Sin justificación", color: "#991b1b" },
] as const;

export default function PartyStackedBars({ data, selectedParty, onSelectParty }: PartyStackedBarsProps) {
  const chartHeight = Math.max(300, data.length * 48);

  const chartData = data.map((p) => {
    const total = p.totalAttendance + p.totalValid + p.totalInvalid + p.totalNoJust;
    return {
      name: p.party,
      pctAttendance: total > 0 ? (p.totalAttendance / total) * 100 : 0,
      pctValid: total > 0 ? (p.totalValid / total) * 100 : 0,
      pctInvalid: total > 0 ? (p.totalInvalid / total) * 100 : 0,
      pctNoJust: total > 0 ? (p.totalNoJust / total) * 100 : 0,
      // keep raw values for tooltip
      totalAttendance: p.totalAttendance,
      totalValid: p.totalValid,
      totalInvalid: p.totalInvalid,
      totalNoJust: p.totalNoJust,
      avgPct: p.avgPct,
      count: p.count,
    };
  });

  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-white/[0.06]">
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">
        Asistencia por Partido
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Distribución de días por categoría · Ordenado por % asistencia
      </p>

      <div role="img" aria-label="Gráfico de barras horizontales apiladas mostrando asistencia por partido">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={160}
              tick={(props: any) => {
                const { x, y, payload } = props;
                const isSelected = !selectedParty || selectedParty === payload.value;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    className={`text-xs sm:text-sm fill-current ${
                      isSelected
                        ? "text-slate-700 dark:text-slate-200 font-medium"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {payload.value.length > 22
                      ? payload.value.slice(0, 20) + "…"
                      : payload.value}
                  </text>
                );
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-[#16162a] border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 shadow-lg text-sm">
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">
                      {d.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                      {d.count} miembro{d.count > 1 ? "s" : ""} · {d.avgPct}% asistencia
                    </div>
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-2 py-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-slate-600 dark:text-slate-300">{cat.name}:</span>
                        <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                          {d[cat.rawKey]}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">
                          ({d[cat.key].toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            {CATEGORIES.map((cat) => (
              <Bar
                key={cat.key}
                dataKey={cat.key}
                stackId="a"
                fill={cat.color}
                radius={
                  cat.key === "pctAttendance"
                    ? [0, 0, 0, 0]
                    : cat.key === "pctNoJust"
                      ? [0, 4, 4, 0]
                      : [0, 0, 0, 0]
                }
                onClick={(data: any) => {
                  if (data?.name) {
                    onSelectParty(selectedParty === data.name ? null : data.name);
                  }
                }}
                className="cursor-pointer"
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fillOpacity={
                      selectedParty && selectedParty !== entry.name ? 0.3 : 0.85
                    }
                  />
                ))}
                {cat.key === "pctNoJust" && (
                  <LabelList
                    dataKey="avgPct"
                    position="right"
                    formatter={(val: number) => `${val}%`}
                    className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
}
