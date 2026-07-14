import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import GlobalErrorListener from "../../components/GlobalErrorListener";

const reportErrorMock = vi.fn();
vi.mock("@/lib/reportError", () => ({ reportError: (...args: unknown[]) => reportErrorMock(...args) }));

describe("GlobalErrorListener", () => {
  it("reports a window error event", () => {
    render(<GlobalErrorListener />);

    window.dispatchEvent(
      new ErrorEvent("error", { message: "Boom", error: new Error("Boom") }),
    );

    expect(reportErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Boom" }),
    );
  });

  it("reports an unhandled promise rejection", () => {
    render(<GlobalErrorListener />);

    const event = new Event("unhandledrejection") as PromiseRejectionEvent & {
      reason: unknown;
    };
    Object.defineProperty(event, "reason", { value: new Error("Rejected") });
    window.dispatchEvent(event);

    expect(reportErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Rejected" }),
    );
  });

  it("renders nothing", () => {
    const { container } = render(<GlobalErrorListener />);
    expect(container).toBeEmptyDOMElement();
  });
});
