import { render, screen } from "@testing-library/react";
import { ChatItem } from "../ChatItem";
import { Chat } from "@/entities/chat/model/types";

const mockChat: Chat = {
  id: "chat-1",
  name: "Test Chat",
  avatar: "https://example.com/avatar.jpg",
  lastMessage: "Last message text",
  lastMessageTime: Date.now(),
};

describe("ChatItem", () => {
  it("должен отображать информацию о чате", () => {
    render(<ChatItem chat={mockChat} isActive={false} onClick={() => {}} />);

    expect(screen.getByText("Test Chat")).toBeInTheDocument();
    expect(screen.getByText("Last message text")).toBeInTheDocument();
    expect(screen.getByAltText("Test Chat")).toHaveAttribute(
      "src",
      mockChat.avatar
    );
  });

  it("должен применять активный стиль, когда isActive=true", () => {
    const { container } = render(
      <ChatItem chat={mockChat} isActive={true} onClick={() => {}} />
    );

    const chatItem = container.firstChild as HTMLElement;
    expect(chatItem).toHaveClass("bg-blue-50");
  });

  it("должен вызывать onClick при клике", () => {
    const handleClick = jest.fn();
    render(<ChatItem chat={mockChat} isActive={false} onClick={handleClick} />);

    const chatItem = screen.getByText("Test Chat").closest("div");
    chatItem?.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
