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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
        border: "1px solid #E5E5E5",
      }}
    >
      {cards.map(({ label, pct, frac, color }, i) => (
        <div
          key={label}
          style={{
            padding: 24,
            borderRight: i < cards.length - 1 ? "1px solid #E5E5E5" : "none",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: "#5E5E5E",
              letterSpacing: 1,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: -2, color: "#000" }}>
            {pct}%
          </span>
          <div style={{ background: "#E5E5E5", height: 4 }}>
            <div style={{ background: color, height: 4, width: `${frac * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
