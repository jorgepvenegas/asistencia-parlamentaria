import { getPartyColor } from "../constants/colors";

interface PartyInfo {
  party: string;
  count: number;
}

interface PartyPillsProps {
  parties: PartyInfo[];
  selectedParty: string | null;
  onSelect: (party: string | null) => void;
}

export default function PartyPills({ parties, selectedParty, onSelect }: PartyPillsProps) {
  return (
    <div className="bg-white dark:bg-[#16162a] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-white/[0.06] space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Filtrar por partido
        </span>
        {selectedParty && (
          <button
            onClick={() => onSelect(null)}
            className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        )}
      </div>

      {/* Mobile: dropdown */}
      <div className="sm:hidden">
        <select
          value={selectedParty || ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
            bg-slate-50 dark:bg-white/[0.05] text-sm text-slate-900 dark:text-slate-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <option value="">Todos los partidos</option>
          {parties.map((p) => (
            <option key={p.party} value={p.party}>
              {p.party} ({p.count})
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: grid with checkboxes */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-2">
        {parties.map((p) => {
          const color = getPartyColor(p.party);
          const isActive = selectedParty === p.party;
          return (
            <label
              key={p.party}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                cursor-pointer border transition-all duration-200
                hover:shadow-md
                focus-within:ring-2 focus-within:ring-offset-2
              `}
              style={{
                backgroundColor: isActive ? color + "22" : undefined,
                borderColor: isActive ? color : color + "44",
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onSelect(isActive ? null : p.party)}
                className="sr-only"
              />
              <span
                className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors duration-200"
                style={{
                  borderColor: color,
                  backgroundColor: isActive ? color : "transparent",
                }}
              >
                {isActive && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate" style={{ color: isActive ? color : undefined }}>
                {p.party}
              </span>
              <span className="ml-auto text-xs text-slate-400 shrink-0">
                {p.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
