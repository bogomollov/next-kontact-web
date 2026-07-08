import express, { Request, Response, NextFunction } from "express";
import { isAuth, isAdmin } from "../middleware/auth";
import { getAllMessages, createMessage } from "../services/message.service";
import { getChatMemberIds } from "../services/chat.service";
import { broadcast } from "../lib/ws";
import { parsePagination } from "../lib/pagination";

const router = express.Router();

router.get("/", isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getAllMessages(parsePagination(req.query));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chat_id, content } = req.body;
    const chatId = Number(chat_id);
    const message = await createMessage(chatId, req.token!.id, content);

    const memberIds = await getChatMemberIds(chatId);
    broadcast(memberIds, "new_message", { chatId, message });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

export default router;
