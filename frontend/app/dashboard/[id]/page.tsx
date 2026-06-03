"use client";
import ChatHeader from "@/features/chat/components/ChatHeader";
import ChatContent from "@/features/chat/components/ChatContent";
import ChatForm from "@/features/chat/components/ChatForm";
import { apiFetch } from "@/lib/apiFetch";
import { notFound } from "next/navigation";
import { IChat, IMe } from "@/types";
import { getMe } from "../layout";
import useSWR from "swr";
import React from "react";

async function getChatId(url: string) {
  const res = await apiFetch(url, {
    credentials: "include",
  });
  return res.json();
}

async function readMessages(url: string) {
  await apiFetch(url, {
    method: "PATCH",
    cache: "no-store",
    credentials: "include",
  });
}

export default function Chat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  useSWR(`/chats/${id}/messages/read`, readMessages, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 800,
  });

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
  } = useSWR<IChat>(`/chats/${id}`, getChatId, {
    revalidateOnReconnect: true,
    revalidateOnFocus: true,
    refreshInterval: 1000,
  });

  if (isChatLoading || isMeLoading) return <div>Загрузка...</div>;
  if (chatError || meError) return <div>Ошибка загрузки данных</div>;
  if (!chat) notFound();
  if (!me) return null;

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-col justify-between pb-[30px]">
        <ChatHeader chat={chat} />
        <ChatContent data={chat} authUser={me} />
        <ChatForm chat_id={chat.id} />
      </div>
    </div>
  );
}
