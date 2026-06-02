import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof z.ZodError) {
    const errors = err.errors.reduce<Record<string, string[]>>((acc, e) => {
      if (e.path?.length) {
        const field = String(e.path[0]);
        acc[field] = [...(acc[field] ?? []), e.message];
      }
      return acc;
    }, {});
    res.status(400).json({ errors });
    return;
  }

  if (err instanceof AppError) {
    const body: Record<string, unknown> = { message: err.message };
    if (err.field) body.errors = { [err.field]: [err.message] };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Ошибка сервера" });
}
