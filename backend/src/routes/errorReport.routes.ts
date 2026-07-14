import express, { Request, Response, NextFunction } from "express";
import { ClientErrorReportSchema } from "../lib/validation";
import { logger } from "../lib/logger";

const router = express.Router();

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = ClientErrorReportSchema.parse(req.body);
    logger.error(
      {
        source: "client",
        ...report,
        userAgent: req.headers["user-agent"],
        reqId: req.id,
      },
      "Client-side error reported"
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
