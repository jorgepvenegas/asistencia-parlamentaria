import { registerRoutes } from "./routes/index.js";
import createApp from "./lib/index.js";

const app = registerRoutes(createApp())

export default app;

export type AppType = typeof app