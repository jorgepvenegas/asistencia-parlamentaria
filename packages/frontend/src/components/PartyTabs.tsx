interface Party {
  partyId: number;
  partyName: string;
}

interface PartyTabsProps {
  parties: Party[];
  memberCounts: Record<string, number>;
}

export default function PartyTabs({ parties, memberCounts }: PartyTabsProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {parties.map((party) => (
        <div
          key={party.partyId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            border: "1px solid #E5E5E5",
          }}
        >
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "#5E5E5E",
            }}
          >
            {party.partyName}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#999",
            }}
          >
            {memberCounts[party.partyName] || 0}
          </span>
        </div>
      ))}
    </div>
  );
}
