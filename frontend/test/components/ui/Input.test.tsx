import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../../../components/ui/Input";

describe("Input", () => {
  it("renders with the given attributes", () => {
    render(
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        defaultValue="a@b.com"
        required
      />,
    );

    const input = screen.getByPlaceholderText("you@example.com");
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveValue("a@b.com");
    expect(input).toBeRequired();
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="type here" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText("type here"), "hi");

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("prefers inputRef over ref when both are provided", () => {
    const forwardedRef = createRef<HTMLInputElement>();
    const inputRef = createRef<HTMLInputElement>();

    render(<Input ref={forwardedRef} inputRef={inputRef} placeholder="x" />);

    expect(inputRef.current).not.toBeNull();
    expect(inputRef.current).toBe(screen.getByPlaceholderText("x"));
  });
});
