import { Hono } from "hono";
import partiesRoute from "./parties.js";


export function registerRoutes(app: Hono) {
  return app
    .route("/api", partiesRoute);
}