import { IUser } from "./user";

export interface IChatSearchListItem {
  id: number;
  name: string;
  image?: string;
  chat_id: number;
}

export interface IChatListItem {
  id: number;
  type: "private" | "group";
  name: string;
  image?: string;
  unreadCount: number;
  is_online?: boolean;
}

export type TChatListItem = {
  id: number;
  type: "private" | "group";
  name: string;
  image?: string;
  unreadCount: number;
  is_online?: boolean;
};

export interface IChat {
  id: number;
  type: "private" | "group";
  name: string;
  image?: string;
  membersCount?: number;
  is_online?: boolean;
  messages: IMessage[];
}

export interface IMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: IUser;
}
