import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextArea from "../../../components/ui/TextArea";

describe("TextArea", () => {
  it("renders with the given attributes", () => {
    render(
      <TextArea
        id="bio"
        name="bio"
        placeholder="Tell us about yourself"
        rows={4}
        cols={20}
        minLength={2}
        maxLength={100}
        required
      />,
    );

    const textarea = screen.getByPlaceholderText("Tell us about yourself");
    expect(textarea).toHaveAttribute("id", "bio");
    expect(textarea).toHaveAttribute("name", "bio");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAttribute("cols", "20");
    expect(textarea).toHaveAttribute("minlength", "2");
    expect(textarea).toHaveAttribute("maxlength", "100");
    expect(textarea).toBeRequired();
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextArea placeholder="type here" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText("type here"), "hi");

    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
