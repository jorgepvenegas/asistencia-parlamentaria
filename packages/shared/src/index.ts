import type { AppType } from "@quienatiende/api/routes";
import { hc } from "hono/client";


export const client = hc<AppType>(process.env.BASE_URL_API!);
export type Client = typeof client;