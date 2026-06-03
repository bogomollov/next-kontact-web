"use client";
import { IChat, IMe, IMessage } from "@/types";
import ChatAvatar from "@/components/ui/ChatAvatar";
import { useEffect, useRef } from "react";

interface ChatContentProps {
  data: IChat;
  authUser: IMe;
}

export default function ChatContent({ data, authUser }: ChatContentProps) {
  const scrolldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [data?.messages]);

  const scrollToBottom = () => {
    scrolldRef.current?.scrollIntoView();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-[20px] py-[20px]">
      <div className="flex flex-col gap-[10px]">
        {data?.messages?.map((message: IMessage) => (
          <div key={message.id} className="flex items-end gap-[8px]">
            {data?.type === "group" && message.sender_id !== authUser.id && (
              <div className="relative flex flex-col">
                <ChatAvatar
                  chat_id={message.sender.id}
                  chat_image={`/static/users/${message.sender_id}.png`}
                />
              </div>
            )}
            <div
              className={`inline-flex max-w-1/2 items-center gap-[10px] rounded-[12px] px-[10px] py-[8px] ${
                message.sender_id === authUser.id
                  ? "ml-auto bg-blue-200"
                  : "bg-neutral-200"
              }`}
            >
              <div className="flex flex-col">
                {data?.type === "group" &&
                  message.sender_id !== authUser.id &&
                  message.sender && (
                    <p
                      className={`font-medium ${
                        message.sender_id === authUser.id
                          ? "text-blue-500"
                          : "text-neutral-500"
                      }`}
                    >
                      {message.sender.firstName} {message.sender.lastName}{" "}
                      {message.sender.middleName}
                    </p>
                  )}
                <p className="break-all whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              <small
                className={`flex items-center gap-[8px] ${message.sender_id == authUser.id ? "text-blue-500" : "text-neutral-500"}`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {message.sender_id == authUser.id ? (
                  message.isRead ? (
                    <svg
                      width="18"
                      height="11"
                      viewBox="0 0 18 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.86217 5.75619L8.72398 9.618L17 1.34277M1 5.79543L4.86182 9.65724M13.137 1.38201L8.99938 5.51967"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="11"
                      viewBox="0 0 18 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 5.5L8 9.5L17 1"
                        stroke="#3B82F6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )
                ) : undefined}
              </small>
            </div>
          </div>
        ))}
      </div>
      <div ref={scrolldRef} />
    </div>
  );
}
