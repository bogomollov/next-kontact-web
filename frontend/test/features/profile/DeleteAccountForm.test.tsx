import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { IMe } from "@/types";
import DeleteAccountForm from "../../../features/profile/components/DeleteAccountForm";

const apiFetchMock = vi.fn();
vi.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const authUser: IMe = {
  id: 1,
  username: "johndoe",
  email: "john@example.com",
  phone: "+10000000000",
  role_id: 1,
  user: {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    department_id: 1,
    position_id: 1,
  },
};

describe("DeleteAccountForm", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
    refreshMock.mockReset();
  });

  it("sends a DELETE request for the account and refreshes on success", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<DeleteAccountForm authUser={authUser} />);
    await user.click(screen.getByRole("button", { name: "Удалить аккаунт" }));

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/accounts/1",
      expect.objectContaining({ method: "DELETE", credentials: "include" }),
    );
  });

  it("disables the button while the request is pending", async () => {
    const user = userEvent.setup();
    let resolveRequest!: (value: unknown) => void;
    apiFetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<DeleteAccountForm authUser={authUser} />);
    const button = screen.getByRole("button", { name: "Удалить аккаунт" });
    await user.click(button);

    expect(button).toBeDisabled();

    resolveRequest({ ok: true, json: () => Promise.resolve({}) });
    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
  });

  it("does not refresh when the delete request fails", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Не удалось удалить аккаунт" }),
    });

    render(<DeleteAccountForm authUser={authUser} />);
    await user.click(screen.getByRole("button", { name: "Удалить аккаунт" }));

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledTimes(1));
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
