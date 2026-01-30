/**
 * HTTP utility functions for delays and retry logic.
 */

/**
 * Delay execution for a specified number of milliseconds.
 */
export async function withDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic.
 * Retries up to maxAttempts times with exponential backoff.
 */
export async function createRetryableRequest<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, initialDelayMs = 100 } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        await withDelay(delayMs);
      }
    }
  }

  throw lastError;
}
