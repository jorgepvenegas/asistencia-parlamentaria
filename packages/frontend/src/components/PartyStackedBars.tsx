import { useState } from "react";
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
import { getPartyAbbrev, ATTENDANCE_CATEGORIES } from "../constants/colors";
import { CARD_CLASS, TOOLTIP_CLASS } from "../constants/styles";
import { useIsMobile } from "../hooks/useIsMobile";

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

type CategoryKey = "pctAttendance" | "pctValid" | "pctInvalid" | "pctNoJust";
type RawKey = "totalAttendance" | "totalValid" | "totalInvalid" | "totalNoJust";

const RAW_KEY_MAP: Record<typeof ATTENDANCE_CATEGORIES[number]["key"], RawKey> = {
  attendance: "totalAttendance",
  justified: "totalValid",
  unjustified: "totalInvalid",
  noJustification: "totalNoJust",
};

const PCT_KEY_MAP: Record<typeof ATTENDANCE_CATEGORIES[number]["key"], CategoryKey> = {
  attendance: "pctAttendance",
  justified: "pctValid",
  unjustified: "pctInvalid",
  noJustification: "pctNoJust",
};

const CATEGORIES = ATTENDANCE_CATEGORIES.map((cat) => ({
  key: PCT_KEY_MAP[cat.key],
  rawKey: RAW_KEY_MAP[cat.key],
  name: cat.name,
  color: cat.color,
}));

interface ChartRow {
  name: string;
  pctAttendance: number;
  pctValid: number;
  pctInvalid: number;
  pctNoJust: number;
  totalAttendance: number;
  totalValid: number;
  totalInvalid: number;
  totalNoJust: number;
  avgPct: number;
  count: number;
  visiblePct: number;
}

export default function PartyStackedBars({ data, selectedParty, onSelectParty }: PartyStackedBarsProps) {
  const isMobile = useIsMobile();
  const [activeCategories, setActiveCategories] = useState<Set<CategoryKey>>(new Set());

  const toggleCategory = (key: CategoryKey) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); }
      else { next.add(key); }
      return next;
    });
  };

  const visibleCategories = activeCategories.size === 0
    ? CATEGORIES
    : CATEGORIES.filter((c) => activeCategories.has(c.key));

  const chartData = [...data]
    .map((p) => {
      const total = p.totalAttendance + p.totalValid + p.totalInvalid + p.totalNoJust;
      return {
        name: p.party,
        pctAttendance: total > 0 ? (p.totalAttendance / total) * 100 : 0,
        pctValid: total > 0 ? (p.totalValid / total) * 100 : 0,
        pctInvalid: total > 0 ? (p.totalInvalid / total) * 100 : 0,
        pctNoJust: total > 0 ? (p.totalNoJust / total) * 100 : 0,
        totalAttendance: p.totalAttendance,
        totalValid: p.totalValid,
        totalInvalid: p.totalInvalid,
        totalNoJust: p.totalNoJust,
        avgPct: p.avgPct,
        count: p.count,
      };
    })
    .map((row) => ({
      ...row,
      visiblePct: parseFloat(
        visibleCategories.map((c) => row[c.key]).reduce((a, b) => a + b, 0).toFixed(1)
      ),
    }))
    .sort((a, b) => {
      const attendanceVisible = activeCategories.size === 0 || activeCategories.has("pctAttendance");
      if (attendanceVisible) { return b.pctAttendance - a.pctAttendance; }
      return b.visiblePct - a.visiblePct;
    })
    .filter((d) => !selectedParty || d.name === selectedParty);

  const chartHeight = Math.max(chartData.length * 48, 80);

  return (
    <div className={CARD_CLASS}>
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-1">
        {selectedParty ? `Asistencia — ${selectedParty}` : "Asistencia por Partido"}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Distribución de días por categoría · Ordenado por % asistencia
      </p>

      {/* Category toggles */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategories.size === 0 || activeCategories.has(cat.key);
          return (
            <button
              key={cat.key}
              aria-pressed={isActive}
              onClick={() => toggleCategory(cat.key)}
              className={`
                flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
                ${isActive
                  ? "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-white/[0.05]"
                  : "border-slate-200 dark:border-white/[0.06] text-slate-400 dark:text-slate-500 opacity-60"
                }
              `}
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0 transition-opacity"
                style={{ backgroundColor: cat.color, opacity: isActive ? 1 : 0.4 }}
              />
              {cat.name}
            </button>
          );
        })}
      </div>

      <div role="img" aria-label="Gráfico de barras horizontales apiladas mostrando asistencia por partido">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: activeCategories.size > 0 && activeCategories.size < CATEGORIES.length ? 60 : 8, left: 8, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={selectedParty ? 0 : 60}
              hide={!!selectedParty}
              tick={(props: { x: number; y: number; payload: { value: string } }) => {
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
                    {getPartyAbbrev(payload.value)}
                  </text>
                );
              }}
            />
            {!isMobile && (
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) { return null; }
                  const d = payload[0].payload as ChartRow;
                  return (
                    <div className={TOOLTIP_CLASS}>
                      <div className="font-semibold text-slate-900 dark:text-white mb-1">
                        {d.name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                        {d.count} miembro{d.count > 1 ? "s" : ""} · {d.avgPct}% asistencia
                      </div>
                      {visibleCategories.map((cat) => (
                        <div key={cat.key} className="flex items-center gap-2 py-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-slate-600 dark:text-slate-300">{cat.name}:</span>
                          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                            {d[cat.rawKey as RawKey]}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs">
                            ({d[cat.key as CategoryKey].toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
            )}
            {visibleCategories.map((cat, idx) => {
              const isLast = idx === visibleCategories.length - 1;
              return (
                <Bar
                  key={cat.key}
                  dataKey={cat.key}
                  stackId="a"
                  fill={cat.color}
                  radius={isLast ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                  onClick={(data: { name?: string }) => {
                    if (data?.name) {
                      onSelectParty(selectedParty === data.name ? null : data.name);
                      if (isMobile) {
                        setActiveCategories(new Set());
                      }
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
                  {isLast && activeCategories.size > 0 && activeCategories.size < CATEGORIES.length && (
                    <LabelList
                      dataKey="visiblePct"
                      position="right"
                      formatter={(val: number) => `${val}%`}
                      className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
                    />
                  )}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
