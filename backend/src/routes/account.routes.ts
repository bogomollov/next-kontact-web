import express, { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/auth";
import { updateAccount, deleteAccount } from "../services/account.service";

const router = express.Router();

router.patch("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountId = Number(req.params.id);
    if (!accountId) {
      res.status(400).json({ message: "Не указан идентификатор аккаунта" });
      return;
    }

    const { username, password, newPassword, repeatPassword, email, phone, role_id, user_id } =
      req.body;

    if (
      !username &&
      !password &&
      !newPassword &&
      !repeatPassword &&
      !email &&
      !phone &&
      !role_id &&
      !user_id
    ) {
      res.status(409).json({ message: "Укажите хотя бы одно поле для обновления" });
      return;
    }

    const { id: callerId, role: callerRole } = req.token!;
    const account = await updateAccount(accountId, callerId, callerRole, {
      username, password, newPassword, repeatPassword, email, phone, role_id, user_id,
    });
    res.json({ message: "Аккаунт обновлен", account });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountId = Number(req.params.id);
    if (!accountId) {
      res.status(400).json({ message: "Не указан идентификатор аккаунта" });
      return;
    }

    const { id: callerId, role: callerRole } = req.token!;
    const deleted = await deleteAccount(accountId, callerId, callerRole);

    if (deleted.user_id === callerId) {
      res.clearCookie("session");
      req.token = undefined;
    }

    res.json({ message: "Аккаунт удален" });
  } catch (error) {
    next(error);
  }
});

export default router;
