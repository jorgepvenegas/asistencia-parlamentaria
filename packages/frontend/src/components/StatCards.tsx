interface StatCard {
  label: string;
  pct: string;
  frac: number;
  color: string;
}

interface StatCardsProps {
  cards: StatCard[];
}

export default function StatCards({ cards }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 border border-border md:grid-cols-4">
      {cards.map(({ label, pct, frac, color }, index) => (
        <div
          key={label}
          className={`p-6 flex flex-col gap-3 border-r border-border last:border-r-0 md:border-r ${
            index === 1 ? 'md:border-r-0' : ''
          } ${index === 2 || index === 3 ? 'md:border-t' : ''} ${
            index === 3 ? 'md:border-r-0' : ''
          }`}
        >
          <span className="font-mono text-xs font-medium text-subtle tracking-wide">{label}</span>
          <span className="text-4xl font-semibold tracking-tight text-black">{pct}%</span>
          <div className="bg-border h-1">
            <div style={{ background: color, height: 4, width: `${frac * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
