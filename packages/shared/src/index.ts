import type { AppType } from "@quienatiende/api/routes";
import { hc } from "hono/client";


export const client = hc<AppType>("http://localhost:8787");
export type Client = typeof client;