/**
 * Public API exports for automation package.
 */

// Configuration
export { config } from './config.js';

// Types
export type { PoliticianAttendance, PartyData, SyncResult } from './types.js';

// Utilities
export { formatDateDDMMYYYY, getTodayFormatted, generateCurrentMonthDates } from './utils/dates.js';
export { slugify } from './utils/slugs.js';
export { parsePercentage } from './utils/parse.js';
export { withDelay, createRetryableRequest } from './utils/http.js';

// Scrapers
export { scrapeAttendance, scrapeAndWriteFiles } from './scrapers/attendance.js';

// API Clients
export { createPartiesFromFile } from './api-clients/parties.js';
export { createPoliticiansFromFile } from './api-clients/politicians.js';

// Orchestration
export { syncData } from './orchestration/sync-pipeline.js';
