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
    <div className="flex gap-2 overflow-x-auto sm:flex-wrap p-2 -m-2 scrollbar-hide">
      {parties.map((p) => {
        const color = getPartyColor(p.party);
        const isActive = selectedParty === p.party;
        return (
          <button
            key={p.party}
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : p.party)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              whitespace-nowrap shrink-0 sm:shrink
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              ${isActive
                ? "ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-[#0f0f1a]"
                : ""
              }
            `}
            style={{
              backgroundColor: color + "22",
              borderColor: color + "55",
              color: color,
              borderWidth: 1,
              ...(isActive ? { ringColor: color } : {}),
              // ring-color can't be set via style; handled via inline --tw var below
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            {p.party.replace("Partido ", "")}
            <span style={{ color: color + "aa" }}>
              ({p.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
