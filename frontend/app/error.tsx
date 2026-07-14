"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { reportError } from "@/lib/reportError";

export default function Error({
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
    <main>
      <h1>Что-то пошло не так</h1>
      <p>Произошла непредвиденная ошибка. Попробуйте ещё раз.</p>
      <Button onClick={() => reset()}>Попробовать снова</Button>
    </main>
  );
}
