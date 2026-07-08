import express, { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/auth";
import {
  getChats,
  getChatById,
  createPrivateChat,
  searchChats,
  markMessagesRead,
} from "../services/chat.service";
import { broadcast } from "../lib/ws";
import { parsePagination } from "../lib/pagination";

const router = express.Router();

router.get("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getChats(req.token!.id, parsePagination(req.query));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/search", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query as string;
    const data = await searchChats(req.token!.id, query ?? "");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chatId = Number(req.params.id);
    if (!chatId) {
      res.status(400).json({ message: "Не указан идентификатор чата" });
      return;
    }
    const data = await getChatById(chatId, req.token!.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      res.status(400).json({
        message: "Не указан идентификатор пользователя для создания личного чата",
      });
      return;
    }
    const data = await createPrivateChat(req.token!.id, user_id);
    res.status(data.chat_id ? 201 : 200).json(data);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:chat_id/messages/read",
  isAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chatId = Number(req.params.chat_id);
      const readerId = req.token!.id;
      const { count, senderIds } = await markMessagesRead(chatId, readerId);

      if (senderIds.length > 0) {
        broadcast(senderIds, "messages_read", { chatId, readerId });
      }

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
