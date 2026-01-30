import { Hono } from "hono";
import partiesRoute from "./parties.js";
import politiciansRoute from "./politicians.js";
import attendanceRoute from "./attendance.js";


export function registerRoutes(app: Hono) {
  return app
    .route("/api", partiesRoute)
    .route("/api", politiciansRoute)
    .route("/api", attendanceRoute);
}