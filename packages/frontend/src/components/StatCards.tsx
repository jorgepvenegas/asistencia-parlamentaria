interface StatCard {
  label: string;
  pct: string;
  frac: number;
  color: string;
}

interface StatCardsProps {
  cards: StatCard[];
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function StatCards({ cards }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 border border-border rounded-xl overflow-hidden md:grid-cols-4">
      {cards.map(({ label, pct, frac, color }, index) => (
        <div
          key={label}
          className={`p-6 flex flex-col gap-3 border-r border-border last:border-r-0 md:border-r ${
            index === 1 ? 'md:border-r-0' : ''
          } ${index === 2 || index === 3 ? 'md:border-t' : ''} ${
            index === 3 ? 'md:border-r-0' : ''
          }`}
          style={{ backgroundColor: `rgba(${hexToRgb(color)}, 0.04)` }}
        >
          <span className="font-mono text-[10px] font-semibold text-subtle tracking-widest uppercase">
            {label}
          </span>
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-black">{pct}%</span>
          <div className="bg-border/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="rounded-full h-full transition-all duration-500"
              style={{ background: color, width: `${frac * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
