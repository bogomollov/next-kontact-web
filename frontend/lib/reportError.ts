import { apiFetch } from "./apiFetch";

interface ErrorReport {
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
}

// Best-effort: reporting an error must never itself throw or block the UI.
export function reportError(report: ErrorReport): void {
  apiFetch("/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  }).catch(() => {});
}
