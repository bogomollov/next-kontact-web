import express, { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { getMe, getAllUsers } from "../services/user.service";
import { getAllAccounts } from "../services/account.service";
import { getDepartments, getPositions } from "../services/admin.service";
import { parsePagination } from "../lib/pagination";

const router = express.Router();

router.get("/me", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.token?.id) throw new AppError(401, "Ошибка при получении данных пользователя");
    const data = await getMe(req.token.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/accounts", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllAccounts(parsePagination(req.query));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/users", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllUsers(parsePagination(req.query));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/departments", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDepartments(parsePagination(req.query));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/positions", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPositions(parsePagination(req.query));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
