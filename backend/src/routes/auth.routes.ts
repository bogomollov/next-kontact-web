import express, { Request, Response, NextFunction } from "express";
import { register, login } from "../services/auth.service";
import { createSession } from "../lib/session";

const router = express.Router();

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = await register(req.body);
    await createSession(res, payload);
    res.status(201).json({ message: "Успешная регистрация" });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionPayload, user } = await login(req.body);
    await createSession(res, sessionPayload);
    res.status(201).json({ message: "Успешная авторизация", user });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("session");
  req.token = undefined;
  res.json({ message: "Сессия завершена" });
});

export default router;
