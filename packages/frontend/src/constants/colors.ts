/**
 * Party color mapping for visual identification
 */
export const PARTY_COLORS: Record<string, string> = {
  'Partido Comunista': '#E63946',
  'Partido Demócrata Cristiano': '#457B9D',
  'Partido Social Cristiano': '#2A9D8F',
  'Unión Demócrata Independiente': '#E9C46A',
  Independientes: '#6A4C93',
  'Partido Republicano': '#1D3557',
  'Partido Socialista': '#F4A261',
  'Renovación Nacional': '#264653',
  'Frente Amplio': '#06D6A0',
  'Partido Liberal de Chile': '#118AB2',
  Evópoli: '#8B5CF6',
  'Evolución Política': '#8B5CF6',
  'Partido por la Democracia': '#EC4899',
  'Partido Por la Democracia': '#EC4899',
  'Partido Radical': '#F97316',
  'Partido Radical de Chile': '#F97316',
  'Partido Ecologista Verde': '#16A34A',
  'Movimiento Amarillos por Chile': '#EAB308',
  'Partido Demócratas Chile': '#3B82F6',
  'Partido Humanista': '#A855F7',
  'Partido Nacional Libertario': '#0891B2',
  'Partido Acción Humanista': '#D946EF',
  'Federación Regionalista Verde Social': '#65A30D',
};

export function getPartyColor(party: string): string {
  return PARTY_COLORS[party] || '#999';
}

/**
 * Party abbreviations for display
 */
export const PARTY_ABBREV: Record<string, string> = {
  'Partido Ecologista Verde': 'PEV',
  'Movimiento Amarillos por Chile': 'AMA',
  'Evolución Política': 'EVOP',
  'Partido Socialista': 'PS',
  'Partido Demócratas Chile': 'DEM',
  'Partido Demócrata Cristiano': 'PDC',
  'Renovación Nacional': 'RN',
  'Unión Demócrata Independiente': 'UDI',
  'Partido Radical de Chile': 'PR',
  'Partido Republicano': 'PREP',
  'Partido Comunista': 'PC',
  'Partido Por la Democracia': 'PPD',
  'Partido Humanista': 'PH',
  'Partido Social Cristiano': 'PSC',
  'Partido Liberal de Chile': 'LIBERAL',
  'Frente Amplio': 'FA',
  'Partido Nacional Libertario': 'PNL',
  'Partido Acción Humanista': 'PAH',
  Independientes: 'IND',
  'Federación Regionalista Verde Social': 'FRVS',
};

export function getPartyAbbrev(party: string): string {
  return PARTY_ABBREV[party] || party;
}

/**
 * Attendance category keys - single source of truth for naming
 */
export type AttendanceCategoryKey = 'attendance' | 'justified' | 'unjustified' | 'noJust';

/**
 * Attendance colors by category key
 * This is the primary source of truth for attendance-related colors
 */
export const ATTENDANCE_COLORS: Record<AttendanceCategoryKey, string> = {
  attendance: '#4ab170',
  justified: '#F59E0B',
  unjustified: '#EF4444',
  noJust: '#991B1B',
};

/**
 * Attendance category metadata including display names
 * Colors are derived from ATTENDANCE_COLORS for consistency
 */
export const ATTENDANCE_CATEGORIES: {
  key: AttendanceCategoryKey;
  name: string;
  color: string;
}[] = [
  { key: 'attendance', name: 'Asistencia', color: ATTENDANCE_COLORS.attendance },
  { key: 'justified', name: 'Justificado', color: ATTENDANCE_COLORS.justified },
  { key: 'unjustified', name: 'No justificado', color: ATTENDANCE_COLORS.unjustified },
  { key: 'noJust', name: 'Sin justificación', color: ATTENDANCE_COLORS.noJust },
];

/**
 * Helper to get color by attendance category key
 */
export function getAttendanceColor(key: AttendanceCategoryKey): string {
  return ATTENDANCE_COLORS[key];
}

/**
 * Attendance category labels for display
 */
export const ATTENDANCE_LABELS: Record<AttendanceCategoryKey, string> = {
  attendance: 'Asistencia',
  justified: 'Ausente con justificación válida',
  unjustified: 'Ausente con justificación inválida',
  noJust: 'Ausente sin justificación',
};
