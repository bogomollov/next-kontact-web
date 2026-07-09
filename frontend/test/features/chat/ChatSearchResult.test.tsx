import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { IChatSearchListItem } from "@/types";
import { UserSearchResult } from "../../../features/chat/components/ChatSearchResult";

const apiFetchMock = vi.fn();
vi.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const pushMock = vi.fn();
let pathname = "/dashboard";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathname,
}));

describe("UserSearchResult", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
    pushMock.mockReset();
    pathname = "/dashboard";
  });

  it("navigates directly when a chat already exists", async () => {
    const user = userEvent.setup();
    const existing: IChatSearchListItem = {
      id: 2,
      name: "Bob",
      chat_id: 42,
    };

    render(<UserSearchResult user={existing} />);
    await user.click(screen.getByText("Bob"));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/42");
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("creates a chat and navigates to it when none exists yet", async () => {
    const user = userEvent.setup();
    const noChat: IChatSearchListItem = {
      id: 3,
      name: "Carol",
      chat_id: 0,
    };
    apiFetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ chat_id: 99 }),
    });

    render(<UserSearchResult user={noChat} />);
    await user.click(screen.getByText("Carol"));

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/chats",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ user_id: 3 }),
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard/99");
  });

  it("does not navigate when chat creation fails", async () => {
    const user = userEvent.setup();
    const noChat: IChatSearchListItem = {
      id: 4,
      name: "Dave",
      chat_id: 0,
    };
    apiFetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Ошибка" }),
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<UserSearchResult user={noChat} />);
    await user.click(screen.getByText("Dave"));

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it("highlights the result matching the current pathname", () => {
    pathname = "/dashboard/42";
    const existing: IChatSearchListItem = {
      id: 2,
      name: "Bob",
      chat_id: 42,
    };

    render(<UserSearchResult user={existing} />);

    expect(screen.getByText("Bob").closest("div.flex.cursor-pointer")).toHaveClass(
      "bg-neutral-100",
    );
  });
});
