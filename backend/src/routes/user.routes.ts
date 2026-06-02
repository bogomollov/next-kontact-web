import express, { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import multer from "multer";
import { isAuth } from "../middleware/auth";
import { updateUser, searchUsers } from "../services/user.service";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(__dirname, "../../static/users")),
  filename: (req, _file, cb) =>
    cb(null, `${req.token?.id}_tmp.png`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("image");

router.patch("/:id", isAuth, upload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.token!.id;
    const imageFile = req.file as Express.Multer.File | undefined;

    const { firstName, lastName, middleName, department_id, position_id } =
      req.body;

    if (
      !firstName &&
      !lastName &&
      !middleName &&
      !department_id &&
      !position_id &&
      !imageFile
    ) {
      res.status(409).json({ message: "Укажите хотя бы одно поле для обновления" });
      return;
    }

    if (imageFile) {
      const input = path.join(__dirname, "../../static/users", imageFile.filename);
      const output = path.join(__dirname, "../../static/users", `${userId}.png`);
      await sharp(input).png().toFile(output);
      await fs.unlink(input);
    }

    const user = await updateUser(userId, req.body);
    res.status(200).json({ message: "Профиль обновлен", user });
  } catch (error) {
    next(error);
  }
});

router.get("/search", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query as string;
    const data = await searchUsers(query ?? "", req.token!.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
