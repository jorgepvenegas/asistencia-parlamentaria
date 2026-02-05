import type { AppType } from "@quienatiende/api/routes";
import { hc } from "hono/client";

export type Client = ReturnType<typeof hc<AppType>>;

// Pre-configured client with BASE_URL_API injected at build time
const baseUrl = process.env.BASE_URL_API;
if (!baseUrl) {
  throw new Error('BASE_URL_API environment variable is required. Set it before building @quienatiende/shared.');
}
export const client = hc<AppType>(baseUrl);

// Factory for custom URLs
export function createClient(baseUrl: string): Client {
  return hc<AppType>(baseUrl);
}