import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { env } from "./src/lib/env";
import http from "http";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectRedis } from "./src/lib/redis";
import { createWsServer } from "./src/lib/ws";
import { errorHandler } from "./src/middleware/error";
import generalRoutes from "./src/routes/general.routes";
import userRoutes from "./src/routes/user.routes";
import accountRoutes from "./src/routes/account.routes";
import adminRoutes from "./src/routes/admin.routes";
import authRoutes from "./src/routes/auth.routes";
import chatRoutes from "./src/routes/chat.routes";
import messageRoutes from "./src/routes/message.routes";

const app = express();

app.use(
  cors({
    origin: env.NEXT_PUBLIC_URL,
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/static",
  express.static("static", {
    setHeaders: (_res, _req, _stat) => {
      _res.set("Cache-Control", "private, max-age=3600, no-cache");
    },
  })
);

app.use(function (req, _res, next) {
  console.log(req.method, decodeURIComponent(req.url));
  next();
});

app.use("/api", generalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

const server = http.createServer(app);
createWsServer(server);

connectRedis()
  .then(() => {
    server.listen(3001, () => {
      console.log(`Сервер запущен на http://localhost:3001`);
    });
  })
  .catch((error) => {
    console.error("Не удалось подключиться к Redis:", error);
    process.exit(1);
  });
