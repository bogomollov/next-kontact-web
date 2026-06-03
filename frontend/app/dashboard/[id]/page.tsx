"use client";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import useSWR from "swr";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { IChat, IMe, IMessage } from "@/types";
import { getMe } from "../layout";
import { useWs } from "@/lib/WebSocketContext";
import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatContent from "@/features/chat/components/ChatContent";
import ChatForm from "@/features/chat/components/ChatForm";

async function getChatById(url: string) {
  const res = await apiFetch(url, { credentials: "include" });
  return res.json();
}

export default function Chat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const chatId = Number(id);

  const {
    data: me,
    isLoading: isMeLoading,
    error: meError,
  } = useSWR<IMe>("/me", getMe, {
    revalidateOnReconnect: true,
    revalidateOnFocus: true,
  });

  const {
    data: chat,
    isLoading: isChatLoading,
    error: chatError,
  } = useSWR<IChat>(`/chats/${chatId}`, getChatById);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const { subscribe } = useWs();

  // Initialise local message list from the SWR snapshot
  useEffect(() => {
    if (chat?.messages) setMessages(chat.messages);
  }, [chat]);

  const markRead = useCallback(() => {
    apiFetch(`/chats/${chatId}/messages/read`, {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
    });
  }, [chatId]);

  // Mark existing messages as read on mount / chat switch
  useEffect(() => {
    markRead();
  }, [markRead]);

  // Incoming message from any participant
  useEffect(() => {
    return subscribe("new_message", (data) => {
      const { message, chatId: msgChatId } = data as {
        message: IMessage;
        chatId: number;
      };
      if (msgChatId !== chatId) return;
      setMessages((prev) => [...prev, message]);
      markRead();
    });
  }, [subscribe, chatId, markRead]);

  // Counterpart read our messages → flip isRead on our sent messages
  useEffect(() => {
    return subscribe("messages_read", (data) => {
      const { chatId: msgChatId, readerId } = data as {
        chatId: number;
        readerId: number;
      };
      if (msgChatId !== chatId || !me || readerId === me.id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === me.id ? { ...m, isRead: true } : m
        )
      );
    });
  }, [subscribe, chatId, me]);

  if (isChatLoading || isMeLoading) return <div>Загрузка...</div>;
  if (chatError || meError) return <div>Ошибка загрузки данных</div>;
  if (!chat) notFound();
  if (!me) return null;

  const chatWithMessages: IChat = { ...chat, messages };

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-col justify-between pb-[30px]">
        <ChatHeader chat={chatWithMessages} />
        <ChatContent data={chatWithMessages} authUser={me} />
        <ChatForm chat_id={chat.id} />
      </div>
    </div>
  );
}
