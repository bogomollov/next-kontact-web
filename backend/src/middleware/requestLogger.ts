import { randomUUID } from "crypto";
import pinoHttp from "pino-http";
import { logger } from "../lib/logger";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const id = typeof existing === "string" ? existing : randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  // Docker/uptime polls hit this every few seconds; keep it out of the logs.
  autoLogging: { ignore: (req) => req.url === "/health" },
});
