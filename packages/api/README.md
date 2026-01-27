# QuienAtiende API

REST API backend for QuienAtiende - citizen attendance transparency platform.

**Status**: Production Ready
**Version**: 1.0.0
**Framework**: Hono.js 4.0
**Database**: SQLite 3
**Node.js**: 18+ (LTS)

## Quick Start

### Local Development

```bash
# Install dependencies
cd packages/api
pnpm install

# Setup database
pnpm run migrate
pnpm run seed

# Start dev server
pnpm run dev

# Server runs on http://localhost:3000
# API endpoints at http://localhost:3000/api
```

### Running Tests

```bash
# Unit & integration tests
pnpm run test

# Database tests
pnpm run test:db

# Watch mode
pnpm run test:watch
```

## API Overview

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.quienatiende.cr/api`

### Authentication
No authentication required - all endpoints are public.

### Response Format

All responses return JSON with consistent structure:

```json
{
  "data": { /* endpoint-specific data */ },
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 1234
  },
  "metadata": {
    "timestamp": "2026-01-27T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Format

```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": {
    "field": "year",
    "message": "Year must be between 2020 and current year"
  }
}
```

## Endpoints

### Politicians

#### List Politicians
```
GET /politicians?year=2026&party_id=PARTY_001&sort=attendance_desc&limit=100&offset=0
```

Get yearly attendance summary for all active politicians.

**Parameters**:
- `year` (required, integer): Year to retrieve (2020-2026)
- `party_id` (optional, string): Filter by party ID
- `sort` (optional, string): `attendance_desc` | `attendance_asc` | `name_asc` | `name_desc` (default: `attendance_desc`)
- `limit` (optional, integer): Results per page (1-500, default: 100)
- `offset` (optional, integer): Page offset (default: 0)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "POL_001",
      "name": "Juan García",
      "party_id": "PARTY_001",
      "party_name": "Partido Acción Ciudadana",
      "attendance_percent": 85.5,
      "attended_count": 171,
      "unattended_count": 29
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 134
  }
}
```

**Examples**:
```bash
# Get all politicians for 2026
curl "http://localhost:3000/api/politicians?year=2026"

# Get top performers (sorted by attendance descending)
curl "http://localhost:3000/api/politicians?year=2026&sort=attendance_desc&limit=10"

# Filter by party
curl "http://localhost:3000/api/politicians?year=2026&party_id=PARTY_001"

# Pagination
curl "http://localhost:3000/api/politicians?year=2026&limit=50&offset=50"
```

#### Get Politician Details
```
GET /politicians/:id
```

Get full profile and attendance history for specific politician.

**Parameters**:
- `id` (required, path): Politician ID (e.g., `POL_001`)

**Response** (200 OK):
```json
{
  "data": {
    "id": "POL_001",
    "name": "Juan García",
    "party_id": "PARTY_001",
    "party_name": "Partido Acción Ciudadana",
    "party_color": "#16a34a",
    "position": "Deputy",
    "district": "Central",
    "is_active": true
  }
}
```

**Examples**:
```bash
# Get politician details
curl "http://localhost:3000/api/politicians/POL_001"
```

**Error Responses**:
- `404 Not Found`: Politician does not exist

#### Get Politician Attendance History
```
GET /politicians/:id/attendance?year=2026&month=1
```

Get daily attendance records for politician.

**Parameters**:
- `id` (required, path): Politician ID
- `year` (optional, integer): Year filter (default: 2026)
- `month` (optional, integer): Month filter 1-12

**Response** (200 OK):
```json
{
  "data": [
    {
      "date": "2026-01-27",
      "status": "attended",
      "reason": null
    },
    {
      "date": "2026-01-26",
      "status": "excused",
      "reason": "Medical appointment"
    }
  ]
}
```

**Status Values**:
- `attended`: Present at session
- `unattended`: Absent without excuse
- `excused`: Absent with valid reason

**Examples**:
```bash
# Get all 2026 attendance records
curl "http://localhost:3000/api/politicians/POL_001/attendance?year=2026"

# Get January 2026 records
curl "http://localhost:3000/api/politicians/POL_001/attendance?year=2026&month=1"
```

### Parties

#### List Parties
```
GET /parties
```

Get all political parties with colors for UI display.

**Parameters**: None

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "PARTY_001",
      "name": "Partido Acción Ciudadana",
      "slug": "pacs",
      "color": "#16a34a",
      "abbreviation": "PAC"
    }
  ]
}
```

**Examples**:
```bash
curl "http://localhost:3000/api/parties"
```

### Search

#### Autocomplete Search
```
GET /search?q=juan&limit=10
```

Search politicians by name with autocomplete.

**Parameters**:
- `q` (required, string): Search query (2+ characters)
- `limit` (optional, integer): Max results (1-20, default: 10)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "POL_001",
      "name": "Juan García",
      "party_name": "Partido Acción Ciudadana",
      "party_color": "#16a34a"
    }
  ]
}
```

**Examples**:
```bash
# Search for politicians
curl "http://localhost:3000/api/search?q=juan"

# Limit results
curl "http://localhost:3000/api/search?q=juan&limit=5"
```

**Error Responses**:
- `400 Bad Request`: Query too short (< 2 characters)

### Attendance Summary

#### Get Party Attendance Summary
```
GET /attendance/summary?year=2026&party_id=PARTY_001
```

Get aggregated attendance statistics by party.

**Parameters**:
- `year` (required, integer): Year to summarize
- `party_id` (optional, string): Limit to specific party

**Response** (200 OK):
```json
{
  "data": [
    {
      "party_id": "PARTY_001",
      "party_name": "Partido Acción Ciudadana",
      "total_sessions": 200,
      "average_attendance_percent": 82.5,
      "politician_count": 45
    }
  ]
}
```

**Examples**:
```bash
# Party summary for all parties
curl "http://localhost:3000/api/attendance/summary?year=2026"

# Specific party summary
curl "http://localhost:3000/api/attendance/summary?year=2026&party_id=PARTY_001"
```

### Metadata

#### Get System Metadata
```
GET /metadata
```

Get system information and data freshness.

**Parameters**: None

**Response** (200 OK):
```json
{
  "data": {
    "last_update": "2026-01-27T10:00:00Z",
    "data_source": "Official Parliamentary Records",
    "schema_version": "1.0.0",
    "available_years": [2020, 2021, 2022, 2023, 2024, 2025, 2026]
  }
}
```

**Examples**:
```bash
curl "http://localhost:3000/api/metadata"
```

## Error Handling

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| `200` | Success | Data returned |
| `400` | Bad Request | Invalid parameters |
| `404` | Not Found | Politician/resource doesn't exist |
| `500` | Server Error | Database or server issue |

### Common Errors

#### Bad Request (400)
```json
{
  "error": "Invalid year parameter",
  "statusCode": 400,
  "details": {
    "field": "year",
    "message": "Year must be between 2020 and 2026"
  }
}
```

#### Not Found (404)
```json
{
  "error": "Politician not found",
  "statusCode": 404
}
```

#### Server Error (500)
```json
{
  "error": "Database connection failed",
  "statusCode": 500
}
```

## Performance

### Load Times (p95)
- `GET /politicians` (400 records): <500ms
- `GET /politicians/:id`: <100ms
- `GET /search`: <200ms
- `GET /parties`: <50ms

### Caching

No caching headers set (data updated daily). Browsers may cache `GET` responses based on response headers. For production, add:
```
Cache-Control: public, max-age=3600
```

### Rate Limiting

Not implemented. For production deployment, add rate limiting:
```bash
# Recommended: 1000 req/min per IP
```

## CORS

Public API - CORS enabled for all origins. Requests from any domain are allowed.

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Data Format Standards

### Dates
ISO 8601 format: `YYYY-MM-DD` (e.g., `2026-01-27`)

### Colors
Hex format: `#RRGGBB` (e.g., `#16a34a` for green)

### IDs
Format: `TYPE_NNN` (e.g., `POL_001`, `PARTY_001`)

## Database Schema

### politicians table
```sql
CREATE TABLE politicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  party_id TEXT NOT NULL,
  position TEXT,
  district TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (party_id) REFERENCES parties(id)
);
```

### attendance_records table
```sql
CREATE TABLE attendance_records (
  id TEXT PRIMARY KEY,
  politician_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL, -- 'attended', 'unattended', 'excused'
  reason TEXT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  FOREIGN KEY (politician_id) REFERENCES politicians(id),
  UNIQUE (politician_id, date)
);
```

### parties table
```sql
CREATE TABLE parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  color TEXT NOT NULL,
  abbreviation TEXT
);
```

## Architecture

### Request Flow
```
HTTP Request → CORS Middleware → Route Handler → Service Layer → Database → Response
```

### Directory Structure
```
packages/api/
├── src/
│   ├── index.ts           # App entry point
│   ├── routes/            # HTTP route handlers
│   │   ├── politicians.ts
│   │   ├── parties.ts
│   │   ├── search.ts
│   │   ├── attendance.ts
│   │   └── metadata.ts
│   ├── services/          # Business logic
│   │   ├── politicians.ts
│   │   ├── parties.ts
│   │   └── search.ts
│   ├── middleware/        # Middleware (CORS, errors)
│   │   ├── cors.ts
│   │   └── errorHandler.ts
│   └── db/
│       ├── init.ts        # Database connection
│       └── migrate.ts     # Migration runner
├── db/
│   ├── migrations/        # SQL migrations
│   └── seed.ts           # Seed script
└── tests/                # Test suites
```

## Development

### Adding a New Endpoint

1. **Create route handler** in `src/routes/`
2. **Create service logic** in `src/services/` if needed
3. **Register route** in `src/index.ts`
4. **Add tests** in `tests/`
5. **Document endpoint** in this README

### Running Tests

```bash
# All tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

### Linting & Formatting

```bash
# Check code quality
pnpm run lint

# Format code
pnpm run format
```

## Production Deployment

### Environment Variables

```bash
NODE_ENV=production
API_PORT=3000
API_URL=https://api.quienatiende.cr
DB_PATH=/var/lib/quienatiende/quienatiende.db
```

### Build

```bash
pnpm run build
pnpm run start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build
CMD ["pnpm", "run", "start"]
```

## Support

### Debugging

Enable debug logging:
```bash
DEBUG=* pnpm run dev
```

### Issues

Report bugs: https://github.com/your-repo/issues

### Documentation

- Full API spec: [contracts/openapi.yaml](../../specs/001-attendance-visibility/contracts/openapi.yaml)
- Architecture: [plan.md](../../specs/001-attendance-visibility/plan.md)
- Data model: [data-model.md](../../specs/001-attendance-visibility/data-model.md)

## License

MIT License - See LICENSE file
