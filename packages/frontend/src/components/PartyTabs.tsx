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
    <div className="flex gap-2 flex-wrap">
      {parties.map((party) => (
        <div
          key={party.partyId}
          className="flex items-center gap-2 px-5 py-2.5 border border-border"
        >
          <span className="font-display text-xs font-medium text-subtle">{party.partyName}</span>
          <span className="font-mono text-xs text-muted">{memberCounts[party.partyName] || 0}</span>
        </div>
      ))}
    </div>
  );
}
