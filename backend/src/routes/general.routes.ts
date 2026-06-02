import express, { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { getMe, getAllUsers } from "../services/user.service";
import { getAllAccounts } from "../services/account.service";
import { getDepartments, getPositions } from "../services/admin.service";

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

router.get("/accounts", isAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllAccounts();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/users", isAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/departments", isAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDepartments();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/positions", isAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPositions();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
