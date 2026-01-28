import type { AppType } from "@quienatiende/api/routes";
import { hc } from "hono/client";

export type Client = ReturnType<typeof hc<AppType>>;

export function createClient(baseUrl: string): Client {
  return hc<AppType>(baseUrl);
}