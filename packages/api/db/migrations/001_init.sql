-- QuienAtiende Database Schema v1.0.0
-- Initial schema setup for attendance tracking system

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  secondary_color TEXT,
  abbreviation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create politicians table
CREATE TABLE IF NOT EXISTS politicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  party_id TEXT NOT NULL,
  position TEXT,
  district TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL,
  date DATE NOT NULL,
  session_type TEXT,
  status TEXT NOT NULL CHECK(status IN ('attended', 'unattended', 'excused')),
  reason TEXT,
  notes TEXT,
  year INTEGER NOT NULL,
  month INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id),
  UNIQUE(politician_id, date)
);

-- Create attendance_summaries table
CREATE TABLE IF NOT EXISTS attendance_summaries (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER,
  total_sessions INTEGER NOT NULL,
  attended_count INTEGER NOT NULL,
  unattended_count INTEGER NOT NULL,
  excused_count INTEGER NOT NULL,
  percentage_attended REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (politician_id) REFERENCES politicians(id),
  UNIQUE(politician_id, year, month)
);

-- Create metadata table
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance optimization
CREATE INDEX IF NOT EXISTS idx_politicians_party_id ON politicians(party_id);
CREATE INDEX IF NOT EXISTS idx_politicians_name_active ON politicians(name) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_politicians_created_at ON politicians(created_at);

CREATE INDEX IF NOT EXISTS idx_attendance_records_politician_year_month ON attendance_records(politician_id, year, month);
CREATE INDEX IF NOT EXISTS idx_attendance_records_politician_year ON attendance_records(politician_id, year);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_year_month ON attendance_records(year, month);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_attendance_summaries_year_month_percentage ON attendance_summaries(year, month, percentage_attended);
CREATE INDEX IF NOT EXISTS idx_attendance_summaries_politician_year ON attendance_summaries(politician_id, year);

CREATE INDEX IF NOT EXISTS idx_parties_slug ON parties(slug);
