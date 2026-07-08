"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { apiFetch } from "@/lib/apiFetch";
import {
  IChatListItem,
  IMe,
  IMessage,
  PaginatedResponse,
  TChatListItem,
} from "@/types";
import { LeftSidebar } from "@/features/dashboard/components/LeftSidebar";
import { WebSocketProvider, useWs } from "@/lib/WebSocketContext";

export async function getMe(url: string) {
  const res = await apiFetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }
  return res.json();
}

async function getChats(url: string) {
  const res = await apiFetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  return res.json();
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: me, error: meError } = useSWR<IMe>(`/me`, getMe, {
    revalidateOnReconnect: true,
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (meError) router.replace("/login");
  }, [meError, router]);

  const { data: chatsResponse } = useSWR<PaginatedResponse<IChatListItem>>(
    `/chats`,
    getChats
  );
  const initialChatList = chatsResponse?.data;

  const [chatList, setChatList] = useState<TChatListItem[]>([]);
  const { subscribe } = useWs();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const meIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    meIdRef.current = me?.id;
  }, [me?.id]);

  // Seed local state from initial SWR fetch
  useEffect(() => {
    if (initialChatList) setChatList(initialChatList);
  }, [initialChatList]);

  // Reset unread badge when the user navigates into a chat
  useEffect(() => {
    const match = pathname.match(/^\/dashboard\/(\d+)$/);
    if (!match) return;
    const activeChatId = Number(match[1]);
    setChatList((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, unreadCount: 0 } : c))
    );
  }, [pathname]);

  // Increment unread count in sidebar when a new message arrives
  useEffect(() => {
    return subscribe("new_message", (data) => {
      const { message, chatId } = data as { message: IMessage; chatId: number };

      // Own messages don't produce unread badges
      if (message.sender_id === meIdRef.current) return;

      // Don't badge the chat that's currently open
      const activeChatId = pathnameRef.current.match(/^\/dashboard\/(\d+)$/)?.[1];
      if (Number(activeChatId) === chatId) return;

      setChatList((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, unreadCount: c.unreadCount + 1 } : c
        )
      );
    });
  }, [subscribe]);

  if (!me || !initialChatList) return null;

  return (
    <div className="flex h-screen">
      <div className="flex w-auto max-w-[400px] flex-col border-r border-r-neutral-200">
        <LeftSidebar authUser={me} allchats={chatList} />
      </div>
      {children}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WebSocketProvider>
      <DashboardShell>{children}</DashboardShell>
    </WebSocketProvider>
  );
}
