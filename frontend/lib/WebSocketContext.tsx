"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

type WsHandler = (payload: unknown) => void;

interface WsContextValue {
  /** Subscribe to a WS event type. Returns an unsubscribe function. */
  subscribe: (type: string, handler: WsHandler) => () => void;
}

const WsContext = createContext<WsContextValue | null>(null);

const WS_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_WS_URL!
    : "ws://localhost:3001/ws";

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlers = useRef(new Map<string, Set<WsHandler>>());

  const subscribe = useCallback((type: string, handler: WsHandler) => {
    if (!handlers.current.has(type)) handlers.current.set(type, new Set());
    handlers.current.get(type)!.add(handler);
    return () => handlers.current.get(type)?.delete(handler);
  }, []);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data as string);
          handlers.current.get(type)?.forEach((h) => h(payload));
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (event) => {
        if (!isMounted || event.code === 4001) return;
        setTimeout(connect, 2_000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      isMounted = false;
      wsRef.current?.close();
    };
  }, []);

  return <WsContext.Provider value={{ subscribe }}>{children}</WsContext.Provider>;
}

export function useWs(): WsContextValue {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used inside <WebSocketProvider>");
  return ctx;
}
