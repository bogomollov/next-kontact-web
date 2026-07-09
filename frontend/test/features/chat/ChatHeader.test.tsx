import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { IChat } from "@/types";
import ChatHeader from "../../../features/chat/components/ChatHeader";

const baseChat: IChat = {
  id: 1,
  type: "private",
  name: "Alice",
  messages: [],
};

describe("ChatHeader", () => {
  it("shows the online status for a private chat that is online", () => {
    render(<ChatHeader chat={{ ...baseChat, is_online: true }} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("в сети")).toBeInTheDocument();
  });

  it("shows the offline status for a private chat that is offline", () => {
    render(<ChatHeader chat={{ ...baseChat, is_online: false }} />);

    expect(screen.getByText("не в сети")).toBeInTheDocument();
  });

  it.each([
    [1, "1 участник"],
    [2, "2 участника"],
    [5, "5 участников"],
    [21, "21 участник"],
  ])("declines the member count %d as %s", (membersCount, expected) => {
    render(
      <ChatHeader
        chat={{ ...baseChat, type: "group", name: "Team", membersCount }}
      />,
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
