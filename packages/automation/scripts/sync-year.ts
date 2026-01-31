/**
 * Sync attendance data for a specific year.
 * Usage: pnpm sync:year <year>
 */

import { syncDataYearly } from '../src/orchestration/sync-pipeline.js';

const year = parseInt(process.argv[2], 10);

if (!year || year < 2000 || year > 2100) {
  console.error('Usage: pnpm sync:year <year>');
  console.error('Year must be between 2000 and 2100');
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log(`Starting yearly sync for ${year}...`);
const result = await syncDataYearly(year);
// eslint-disable-next-line no-console
console.log('\nSync result:', JSON.stringify(result, null, 2));
