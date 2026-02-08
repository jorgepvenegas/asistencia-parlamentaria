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

export const PARTY_ABBREV: Record<string, string> = {
  "Partido Ecologista Verde": "PEV",
  "Movimiento Amarillos por Chile": "AMA",
  "Evolución Política": "EVOP",
  "Partido Socialista": "PS",
  "Partido Demócratas Chile": "DEM",
  "Partido Demócrata Cristiano": "PDC",
  "Renovación Nacional": "RN",
  "Unión Demócrata Independiente": "UDI",
  "Partido Radical de Chile": "PR",
  "Partido Republicano": "PREP",
  "Partido Comunista": "PC",
  "Partido Por la Democracia": "PPD",
  "Partido Humanista": "PH",
  "Partido Social Cristiano": "PSC",
  "Partido Liberal de Chile": "LIBERAL",
  "Frente Amplio": "FA",
  "Partido Nacional Libertario": "PNL",
  "Partido Acción Humanista": "PAH",
  "Independientes": "IND",
  "Federación Regionalista Verde Social": "FRVS",
};

export function getPartyAbbrev(party: string): string {
  return PARTY_ABBREV[party] || party;
}

export const ATTENDANCE_CATEGORIES = [
  { key: "attendance", name: "Asistencia", color: "#22c55e" },
  { key: "justified", name: "Justificado", color: "#f59e0b" },
  { key: "unjustified", name: "No justificado", color: "#ef4444" },
  { key: "noJustification", name: "Sin justificación", color: "#991b1b" },
] as const;
