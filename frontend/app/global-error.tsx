"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/reportError";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <main>
          <h1>Что-то пошло не так</h1>
          <p>Произошла непредвиденная ошибка. Попробуйте ещё раз.</p>
          <button type="button" onClick={() => reset()}>
            Попробовать снова
          </button>
        </main>
      </body>
    </html>
  );
}
