import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { IMe } from "@/types";
import UpdateAccountForm from "../../../features/profile/components/UpdateAccountForm";

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

describe("UpdateAccountForm", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
    refreshMock.mockReset();
  });

  it("prefills the form with the current account data", () => {
    render(<UpdateAccountForm authUser={authUser} />);

    expect(screen.getByLabelText("Отображаемое имя")).toHaveValue("johndoe");
    expect(screen.getByLabelText("Эл.почта")).toHaveValue("john@example.com");
    expect(screen.getByLabelText("Номер телефона")).toHaveValue(
      "+10000000000",
    );
  });

  it("submits the updated fields and refreshes on success", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<UpdateAccountForm authUser={authUser} />);
    await user.clear(screen.getByLabelText("Отображаемое имя"));
    await user.type(screen.getByLabelText("Отображаемое имя"), "janedoe");
    await user.click(screen.getByRole("button", { name: "Сохранить изменения" }));

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/accounts/1",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          username: "janedoe",
          email: "john@example.com",
          phone: "+10000000000",
        }),
      }),
    );
  });

  it("shows field errors returned by the API without refreshing", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ errors: { email: "Эл.почта уже занята" } }),
    });

    render(<UpdateAccountForm authUser={authUser} />);
    await user.click(screen.getByRole("button", { name: "Сохранить изменения" }));

    expect(
      await screen.findByText("Эл.почта уже занята"),
    ).toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("shows a connection error message when the request throws", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValue(new Error("network down"));

    render(<UpdateAccountForm authUser={authUser} />);
    await user.click(screen.getByRole("button", { name: "Сохранить изменения" }));

    expect(
      await screen.findByText("Ошибка при подключении к серверу"),
    ).toBeInTheDocument();
  });
});
