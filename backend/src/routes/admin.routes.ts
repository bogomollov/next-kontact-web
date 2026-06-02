import express, { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/auth";
import { getDashboardData } from "../services/admin.service";

const router = express.Router();

router.get("/", isAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDashboardData();
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
