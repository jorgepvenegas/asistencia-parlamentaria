/**
 * Shared TypeScript types for QuienAtiende
 * Used by both frontend and API packages
 */

export interface Party {
  id: string;
  name: string;
  slug: string;
  color: string;
  secondary_color?: string;
  abbreviation?: string;
  created_at?: string;
}

export interface Politician {
  id: string;
  name: string;
  party_id: string;
  position?: string;
  district?: string;
  photo_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  politician_id: string;
  date: string; // ISO date YYYY-MM-DD
  session_type?: string;
  status: 'attended' | 'unattended' | 'excused';
  reason?: string;
  notes?: string;
  year: number;
  month: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceSummary {
  id: string;
  politician_id: string;
  year: number;
  month?: number;
  total_sessions: number;
  attended_count: number;
  unattended_count: number;
  excused_count: number;
  percentage_attended: number;
  created_at?: string;
  updated_at?: string;
}

export interface Metadata {
  key: string;
  value: string;
  updated_at?: string;
}

export interface PoliticianWithSummary extends Politician {
  party?: Party;
  yearly_summary?: AttendanceSummary;
  percentage_attended?: number;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total?: number;
  };
  metadata?: Record<string, unknown>;
}
