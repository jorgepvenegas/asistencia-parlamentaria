export const PARTY_COLORS: Record<string, string> = {
  "Partido Comunista": "#E63946",
  "Partido Demócrata Cristiano": "#457B9D",
  "Partido Social Cristiano": "#2A9D8F",
  "Unión Demócrata Independiente": "#E9C46A",
  "Independientes": "#6A4C93",
  "Partido Republicano": "#1D3557",
  "Partido Socialista": "#F4A261",
  "Renovación Nacional": "#264653",
  "Frente Amplio": "#06D6A0",
  "Partido Liberal de Chile": "#118AB2",
  "Evópoli": "#8B5CF6",
  "Partido por la Democracia": "#EC4899",
  "Partido Radical": "#F97316",
};

export function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || '#999';
}
