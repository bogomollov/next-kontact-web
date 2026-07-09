import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import InputError from "../../../components/ui/InputError";

describe("InputError", () => {
  it("renders nothing when there is no message", () => {
    const { container } = render(<InputError />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a string message", () => {
    render(<InputError message="Обязательное поле" />);

    expect(screen.getByText("Обязательное поле")).toBeInTheDocument();
  });

  it("renders a list of messages", () => {
    render(<InputError message={["Too short", "Missing digit"]} />);

    expect(screen.getByText(/Too short/)).toBeInTheDocument();
    expect(screen.getByText(/Missing digit/)).toBeInTheDocument();
  });
});
