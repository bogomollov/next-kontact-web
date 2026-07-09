import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatAvatar from "../../../components/ui/ChatAvatar";

describe("ChatAvatar", () => {
  it("renders an image for the given chat", () => {
    render(<ChatAvatar chat_id={7} chat_image="/static/avatar-7.png" />);

    const img = screen.getByAltText("chat avatars 7");
    expect(img).toBeInTheDocument();
  });

  it("falls back to the placeholder image on error", () => {
    render(<ChatAvatar chat_id={7} chat_image="/static/broken.png" />);

    const img = screen.getByAltText("chat avatars 7");
    fireEvent.error(img);

    expect(img.getAttribute("src")).toContain("null.png");
  });
});
