import { vi } from 'vitest';

export const mockSelect = vi.fn();
export const mockInsert = vi.fn();
export const mockUpdate = vi.fn();

/**
 * Proxy that handles any .from().where().limit().innerJoin().groupBy() chain
 * and resolves to `data` when awaited.
 */
export function chain(data: unknown) {
  const handler: ProxyHandler<object> = {
    get(_, prop) {
      if (prop === 'then')
        return (resolve: (v: unknown) => void) => resolve(data);
      return (..._args: unknown[]) => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler);
}
