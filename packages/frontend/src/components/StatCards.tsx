const RESPONSIVE = `
  .stat-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #E5E5E5; }
  .stat-card { border-right: 1px solid #E5E5E5; }
  .stat-card:last-child { border-right: none; }
  @media (max-width: 767px) {
    .stat-cards-grid { grid-template-columns: repeat(2, 1fr); }
    .stat-card:nth-child(2) { border-right: none; }
    .stat-card:nth-child(3) { border-top: 1px solid #E5E5E5; }
    .stat-card:nth-child(4) { border-top: 1px solid #E5E5E5; border-right: none; }
  }
`;

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
    <>
      <style>{RESPONSIVE}</style>
      <div className="stat-cards-grid">
        {cards.map(({ label, pct, frac, color }) => (
          <div
            key={label}
            className="stat-card"
            style={{
              padding: 24,
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
    </>
  );
}
