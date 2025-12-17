import { render, screen } from "@testing-library/react";
import { MessageItem } from "../MessageItem";
import { Message } from "@/entities/message/ui/MessageItem/types";

const mockOwnMessage: Message = {
  id: "msg-1",
  chatId: "chat-1",
  text: "My message",
  authorId: "user-1",
  authorName: "You",
  timestamp: Date.now(),
  isOwn: true,
};

const mockOtherMessage: Message = {
  id: "msg-2",
  chatId: "chat-1",
  text: "Other message",
  authorId: "user-2",
  authorName: "Other User",
  timestamp: Date.now(),
  isOwn: false,
};

describe("MessageItem", () => {
  it("должен отображать собственное сообщение справа", () => {
    const { container } = render(<MessageItem {...mockOwnMessage} />);

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass("justify-end");
    expect(screen.getByText("My message")).toBeInTheDocument();
  });

  it("должен отображать чужое сообщение слева", () => {
    const { container } = render(<MessageItem {...mockOtherMessage} />);

    const messageContainer = container.firstChild as HTMLElement;
    expect(messageContainer).toHaveClass("justify-start");
    expect(screen.getByText("Other message")).toBeInTheDocument();
  });

  it("должен отображать имя автора для чужих сообщений", () => {
    render(<MessageItem {...mockOtherMessage} />);

    expect(screen.getByText("Other User")).toBeInTheDocument();
  });

  it("не должен отображать имя автора для своих сообщений", () => {
    render(<MessageItem {...mockOwnMessage} />);

    expect(screen.queryByText("You")).not.toBeInTheDocument();
  });
});
