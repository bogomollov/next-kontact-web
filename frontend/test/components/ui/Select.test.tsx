import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "../../../components/ui/Select";

const options = [
  { value: 1, label: "Engineering" },
  { value: 2, label: "Sales" },
];

describe("Select", () => {
  it("renders an option for each entry", () => {
    render(<Select name="department" options={options} />);

    expect(
      screen.getByRole("option", { name: "Engineering" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Sales" })).toBeInTheDocument();
  });

  it("reflects the selected value", () => {
    render(<Select name="department" value={2} options={options} onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveValue("2");
  });

  it("calls onChange when a new option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select name="department" defaultValue={1} options={options} onChange={onChange} />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "Sales");

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
