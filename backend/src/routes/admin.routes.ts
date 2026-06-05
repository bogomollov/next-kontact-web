import express, { Request, Response, NextFunction } from "express";
import { isAdmin } from "../middleware/auth";
import { getDashboardData } from "../services/admin.service";

const router = express.Router();

router.get("/", isAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDashboardData();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
