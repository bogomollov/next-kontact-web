import express, { Express, Router } from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "../../src/middleware/error";

export function buildTestApp(basePath: string, router: Router): Express {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(basePath, router);
  app.use(errorHandler);
  return app;
}
