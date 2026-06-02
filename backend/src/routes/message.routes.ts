import express, { Request, Response, NextFunction } from "express";
import { isAuth, isAdmin } from "../middleware/auth";
import { getAllMessages, createMessage } from "../services/message.service";

const router = express.Router();

router.get("/", isAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllMessages();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chat_id, content } = req.body;
    const data = await createMessage(Number(chat_id), req.token!.id, content);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
