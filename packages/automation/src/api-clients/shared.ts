/**
 * Shared API client utilities and patterns.
 */

import { withDelay } from '../utils/http.js';

export interface ApiResult<T> {
  success: boolean;
  successCount: number;
  failureCount: number;
  data: T[];
  errors: Array<{ identifier: string; error: string }>;
}

/**
 * Process items sequentially with delay between requests.
 * Tracks successes and failures.
 */
export async function processWithDelay<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<void>,
  delayMs: number
): Promise<ApiResult<R>> {
  let successCount = 0;
  let failureCount = 0;
  const errors: Array<{ identifier: string; error: string }> = [];

  // eslint-disable-next-line no-console
  console.log(`Processing ${items.length} items...`);

  for (let i = 0; i < items.length; i++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      await processor(items[i]!, i);
      successCount++;
      process.stdout.write('.');
    } catch (error) {
      failureCount++;
      errors.push({
        identifier: String(i),
        error: String(error),
      });
      process.stdout.write('X');
    }

    if (i < items.length - 1) {
      // eslint-disable-next-line no-await-in-loop
      await withDelay(delayMs);
    }
  }

  // eslint-disable-next-line no-console
  console.log('');

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    data: [],
    errors,
  };
}

/**
 * Log API result summary to console.
 */
export function logApiResult(result: ApiResult<unknown>, itemType: string, verbPast: string): void {
  // eslint-disable-next-line no-console
  console.log(`\n✓ Successfully ${verbPast} ${result.successCount} ${itemType}`);

  if (result.failureCount > 0) {
    // eslint-disable-next-line no-console
    console.error(`✗ Failed to ${verbPast.replace('d', '')} ${result.failureCount} ${itemType}:`);
    result.errors.slice(0, 10).forEach(({ identifier, error }) => {
      // eslint-disable-next-line no-console
      console.error(`  - ${identifier}: ${error}`);
    });
    if (result.errors.length > 10) {
      // eslint-disable-next-line no-console
      console.error(`  ... and ${result.errors.length - 10} more`);
    }
  }
}
