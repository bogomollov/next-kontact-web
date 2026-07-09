import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputSearch from "../../../components/ui/InputSearch";

const apiFetchMock = vi.fn();
vi.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("InputSearch", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("reports null results when the query is cleared", () => {
    const callbackData = vi.fn();
    render(<InputSearch callbackData={callbackData} />);

    expect(callbackData).toHaveBeenCalledWith(null);
  });

  it("searches after the user types and debounces the request", async () => {
    const user = userEvent.setup();
    const results = [{ id: 1, name: "Alice", chat_id: 5 }];
    apiFetchMock.mockResolvedValue({
      json: () => Promise.resolve(results),
    });
    const callbackData = vi.fn();

    render(<InputSearch callbackData={callbackData} />);
    await user.type(screen.getByRole("searchbox"), "ali");

    expect(apiFetchMock).not.toHaveBeenCalled();

    await waitFor(
      () =>
        expect(apiFetchMock).toHaveBeenCalledWith(
          "/users/search?query=ali",
          expect.objectContaining({ credentials: "include" }),
        ),
      { timeout: 2000 },
    );
    await waitFor(() => expect(callbackData).toHaveBeenLastCalledWith(results));
  });

  it("reports an empty array when the search request fails", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValue(new Error("network error"));
    const callbackData = vi.fn();

    render(<InputSearch callbackData={callbackData} />);
    await user.type(screen.getByRole("searchbox"), "x");

    await waitFor(() => expect(callbackData).toHaveBeenLastCalledWith([]), {
      timeout: 2000,
    });
  });
});
