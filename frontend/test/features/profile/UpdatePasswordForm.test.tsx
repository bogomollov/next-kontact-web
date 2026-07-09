import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { IMe } from "@/types";
import UpdatePasswordForm from "../../../features/profile/components/UpdatePasswordForm";

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

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Текущий пароль"), "oldpass");
  await user.type(screen.getByLabelText("Новый пароль"), "newpass123");
  await user.type(screen.getByLabelText("Подтверждение пароля"), "newpass123");
  await user.click(screen.getByRole("button", { name: "Сохранить изменения" }));
}

describe("UpdatePasswordForm", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
    refreshMock.mockReset();
  });

  it("submits the password fields and refreshes on success", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<UpdatePasswordForm authUser={authUser} />);
    await fillAndSubmit(user);

    await waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/accounts/1",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          password: "oldpass",
          newPassword: "newpass123",
          repeatPassword: "newpass123",
        }),
      }),
    );
  });

  it("shows the API message on failure without refreshing", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Текущий пароль неверен" }),
    });

    render(<UpdatePasswordForm authUser={authUser} />);
    await fillAndSubmit(user);

    expect(
      await screen.findByText("Текущий пароль неверен"),
    ).toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("shows a connection error message when the request throws", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValue(new Error("network down"));

    render(<UpdatePasswordForm authUser={authUser} />);
    await fillAndSubmit(user);

    expect(
      await screen.findByText("Ошибка при подключении к серверу"),
    ).toBeInTheDocument();
  });
});
