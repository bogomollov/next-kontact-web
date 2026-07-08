import { apiFetch } from "@/lib/apiFetch";
import {
  IAccount,
  IChat,
  IDepartment,
  IMe,
  IMessage,
  IPosition,
  IUser,
  PaginatedResponse,
} from "@/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: "Админ-панель | kontact web",
  description:
    "Современный корпоративный веб-мессенджер. Безопасные чаты, групповые обсуждения, файлообмен и интеграция с корпоративными системами",
};

export default async function Admin() {
  const session = (await cookies()).get("session")?.value;

  const meData = await apiFetch("/me", {
    cache: "force-cache",
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  if (meData.status === 401 || meData.status === 403) redirect("/login");

  const me: IMe = await meData.json();

  if (me.role_id != 2) redirect("/dashboard");

  const accountsData = await apiFetch("/accounts", {
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  const accounts: IAccount[] = (
    (await accountsData.json()) as PaginatedResponse<IAccount>
  ).data;

  const usersData = await apiFetch("/users", {
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  const users: IUser[] = (
    (await usersData.json()) as PaginatedResponse<IUser>
  ).data;

  const departmentsData = await apiFetch("/departments", {
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  const departments: IDepartment[] = (
    (await departmentsData.json()) as PaginatedResponse<IDepartment>
  ).data;

  const positionsData = await apiFetch("/positions", {
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  const positions: IPosition[] = (
    (await positionsData.json()) as PaginatedResponse<IPosition>
  ).data;

  const chatsData = await apiFetch("/chats", {
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  const chats: IChat[] = (
    (await chatsData.json()) as PaginatedResponse<IChat>
  ).data;

  const messagesData = await apiFetch("/messages", {
    headers: {
      Authorization: `Bearer ${session}`,
    },
    credentials: "include",
  });
  const messages: IMessage[] = (
    (await messagesData.json()) as PaginatedResponse<IMessage>
  ).data;

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 bg-neutral-50 px-4 pb-20 sm:px-0">
      <div className="sticky top-0 z-10 inline-flex w-full justify-between bg-neutral-50 p-2.5">
        <Link
          href="/profile"
          className="rounded-full p-2 hover:bg-neutral-200/50"
        >
          <svg
            width="23"
            height="18"
            viewBox="0 0 23 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 8.875H1M1 8.875L8.875 16.75M1 8.875L8.875 1"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <h2>Панель администратора</h2>
        <h5 className="text-gray-600">Все данные веб-сайта</h5>
      </div>
      <div className="flex w-full max-w-[1600px] flex-col gap-5 px-5">
        <div className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-medium">Аккаунты</h4>
            <p className="text-sm text-gray-500">Список аккаунтов</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-6 border-b *:bg-blue-500 *:py-2 *:text-xs *:text-white *:uppercase sm:*:text-sm">
                <span className="rounded-tl-lg text-center font-medium">
                  id
                </span>
                <span className="text-center font-medium">user_id</span>
                <span className="text-center font-medium">username</span>
                <span className="text-center font-medium">email</span>
                <span className="text-center font-medium">phone</span>
                <span className="rounded-tr-lg text-center font-medium">
                  role_id
                </span>
              </div>
              <div className="grid grid-cols-6 *:py-1.5 *:text-xs sm:*:text-sm">
                {accounts.map((account: IAccount) => (
                  <React.Fragment key={account.id}>
                    <p className="truncate px-1 text-center">{account.id}</p>
                    <p className="truncate px-1 text-center">
                      {account.user_id}
                    </p>
                    <p className="truncate px-1 text-center">
                      {account.username}
                    </p>
                    <p className="truncate px-1 text-center">
                      {account.email || "null"}
                    </p>
                    <p className="truncate px-1 text-center">
                      {account.phone || "null"}
                    </p>
                    <p className="truncate px-1 text-center">
                      {account.role_id}
                    </p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-medium">Пользователи</h4>
            <p className="text-sm text-gray-500">Список пользователей</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-6 *:bg-blue-500 *:py-2 *:text-xs *:text-white *:uppercase sm:*:text-sm">
                <span className="rounded-tl-lg text-center font-medium">
                  id
                </span>
                <span className="text-center font-medium">firstName</span>
                <span className="text-center font-medium">lastName</span>
                <span className="text-center font-medium">middleName</span>
                <span className="text-center font-medium">department_id</span>
                <span className="rounded-tr-lg text-center font-medium">
                  position_id
                </span>
              </div>
              <div className="grid grid-cols-6 *:py-1.5 *:text-xs sm:*:text-sm">
                {users.map((user: IUser) => (
                  <React.Fragment key={user.id}>
                    <p className="truncate px-1 text-center">{user.id}</p>
                    <p className="truncate px-1 text-center">
                      {user.firstName}
                    </p>
                    <p className="truncate px-1 text-center">{user.lastName}</p>
                    <p className="truncate px-1 text-center">
                      {user.middleName}
                    </p>
                    <p className="truncate px-1 text-center">
                      {user.department_id}
                    </p>
                    <p className="truncate px-1 text-center">
                      {user.position_id}
                    </p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-medium">Департаменты</h4>
            <p className="text-sm text-gray-500">Список департаментов</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[300px]">
              <div className="grid grid-cols-2 *:bg-blue-500 *:py-2 *:text-xs *:text-white *:uppercase sm:*:text-sm">
                <span className="rounded-tl-lg text-center font-medium">
                  id
                </span>
                <span className="rounded-tr-lg text-center font-medium">
                  name
                </span>
              </div>
              <div className="grid grid-cols-2 *:py-1.5 *:text-xs sm:*:text-sm">
                {departments.map((department: IDepartment) => (
                  <React.Fragment key={department.id}>
                    <p className="truncate px-1 text-center">{department.id}</p>
                    <p className="truncate px-1 text-center">
                      {department.name}
                    </p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-medium">Должности</h4>
            <p className="text-sm text-gray-500">Список должностей</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[300px]">
              <div className="grid grid-cols-2 *:bg-blue-500 *:py-2 *:text-xs *:text-white *:uppercase sm:*:text-sm">
                <span className="rounded-tl-lg text-center font-medium">
                  id
                </span>
                <span className="rounded-tr-lg text-center font-medium">
                  name
                </span>
              </div>
              <div className="grid grid-cols-2 *:py-1.5 *:text-xs sm:*:text-sm">
                {positions.map((position: IPosition) => (
                  <React.Fragment key={position.id}>
                    <p className="truncate px-1 text-center">{position.id}</p>
                    <p className="truncate px-1 text-center">{position.name}</p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-medium">Чаты</h4>
            <p className="text-sm text-gray-500">Список чатов</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-3 *:bg-blue-500 *:py-2 *:text-xs *:text-white *:uppercase sm:*:text-sm">
                <span className="rounded-tl-lg text-center font-medium">
                  id
                </span>
                <span className="text-center font-medium">name</span>
                <span className="rounded-tr-lg text-center font-medium">
                  type
                </span>
              </div>
              <div className="grid grid-cols-3 *:py-1.5 *:text-xs sm:*:text-sm">
                {chats.map((chat: IChat) => (
                  <React.Fragment key={chat.id}>
                    <p className="truncate px-1 text-center">{chat.id}</p>
                    <p className="truncate px-1 text-center">{chat.name}</p>
                    <p className="truncate px-1 text-center">{chat.type}</p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-medium">Сообщения</h4>
            <p className="text-sm text-gray-500">Список сообщений</p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-6 *:bg-blue-500 *:py-2 *:text-xs *:text-white *:uppercase sm:*:text-sm">
                <span className="rounded-tl-lg text-center font-medium">
                  id
                </span>
                <span className="text-center font-medium">chat_id</span>
                <span className="text-center font-medium">sender_id</span>
                <span className="text-center font-medium">content</span>
                <span className="text-center font-medium">isRead</span>
                <span className="rounded-tr-lg text-center font-medium">
                  createdAt
                </span>
              </div>
              <div className="grid grid-cols-6 *:py-1.5 *:text-xs sm:*:text-sm">
                {messages.map((message: IMessage) => (
                  <React.Fragment key={message.id}>
                    <p className="truncate px-1 text-center">{message.id}</p>
                    <p className="truncate px-1 text-center">
                      {message.chat_id}
                    </p>
                    <p className="truncate px-1 text-center">
                      {message.sender_id || "null"}
                    </p>
                    <p className="truncate px-1 text-center">
                      {message.content}
                    </p>
                    <p className="truncate px-1 text-center">
                      {`${message.isRead}`}
                    </p>
                    <p className="truncate px-1 text-center">
                      {`${message.createdAt}`}
                    </p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
