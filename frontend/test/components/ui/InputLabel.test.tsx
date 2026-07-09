import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import InputLabel from "../../../components/ui/InputLabel";

describe("InputLabel", () => {
  it("associates the label with the given input via htmlFor", () => {
    render(
      <>
        <InputLabel htmlFor="username">Username</InputLabel>
        <input id="username" />
      </>,
    );

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });
});
