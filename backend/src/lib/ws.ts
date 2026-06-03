import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { decrypt } from "./session";

// userId → all open connections for that user (multiple tabs)
const clients = new Map<number, Set<WebSocket>>();

export function createWsServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  // Heartbeat — keeps connections alive through proxies with idle timeouts
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    });
  }, 30_000);

  wss.on("close", () => clearInterval(heartbeat));

  wss.on("connection", async (ws, req) => {
    const userId = await authenticateUpgrade(req.headers.cookie);
    if (!userId) {
      ws.close(4001, "Unauthorized");
      return;
    }

    if (!clients.has(userId)) clients.set(userId, new Set());
    clients.get(userId)!.add(ws);

    const cleanup = () => {
      const set = clients.get(userId);
      if (set) {
        set.delete(ws);
        if (set.size === 0) clients.delete(userId);
      }
    };

    ws.on("close", cleanup);
    ws.on("error", cleanup);
  });

  return wss;
}

async function authenticateUpgrade(cookieHeader = ""): Promise<number | null> {
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const payload = await decrypt(cookies.session);
  return payload?.id ?? null;
}

export function broadcast(userIds: number[], type: string, payload: unknown) {
  const data = JSON.stringify({ type, payload });
  for (const userId of userIds) {
    clients.get(userId)?.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });
  }
}
