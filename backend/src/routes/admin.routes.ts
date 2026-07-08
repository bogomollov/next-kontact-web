import express, { Request, Response, NextFunction } from "express";
import { isAdmin } from "../middleware/auth";
import { getDashboardData } from "../services/admin.service";
import { parsePagination } from "../lib/pagination";

const router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDashboardData(parsePagination(req.query));
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
