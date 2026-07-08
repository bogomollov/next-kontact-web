"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { IChatSearchListItem } from "@/types";
import { apiFetch } from "@/lib/apiFetch";
import ChatAvatar from "@/components/ui/ChatAvatar";

interface UserSearchResultProps {
  user: IChatSearchListItem;
}

export function UserSearchResult({ user }: UserSearchResultProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleUserClick = async () => {
    if (user.chat_id) {
      router.push(`/dashboard/${user.chat_id}`);
    } else {
      try {
        const response = await apiFetch("/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          credentials: "include",
          body: JSON.stringify({ user_id: user.id }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/dashboard/${data.chat_id}`);
        } else {
          const errorData = await response.json();
          console.error("Ошибка при создании чата:", errorData.message);
        }
      } catch (error) {
        console.error("Ошибка сети:", error);
      }
    }
  };

  return (
    <div
      onClick={handleUserClick}
      className={`flex cursor-pointer items-center gap-[20px] rounded-[10px] px-[20px] py-[10px] ${pathname == `/dashboard/${user.chat_id}` ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
    >
      <ChatAvatar chat_id={user.id} chat_image={user.image} />
      <div className="flex flex-1 items-center justify-between">
        <h5>{user.name}</h5>
      </div>
    </div>
  );
}
