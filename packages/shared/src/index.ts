import type { AppType } from "@quienatiende/api/routes";
import { hc } from "hono/client";

export type Client = ReturnType<typeof hc<AppType>>;

// Pre-configured client with BASE_URL_API injected at build time
export const client = hc<AppType>(process.env.BASE_URL_API!);

// Factory for custom URLs
export function createClient(baseUrl: string): Client {
  return hc<AppType>(baseUrl);
}