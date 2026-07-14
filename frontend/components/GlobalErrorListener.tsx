"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/reportError";

// error.tsx/global-error.tsx only catch errors thrown during React rendering.
// This covers everything else: event handlers, timers, and unhandled
// promise rejections.
export default function GlobalErrorListener() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportError({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        url: window.location.href,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
