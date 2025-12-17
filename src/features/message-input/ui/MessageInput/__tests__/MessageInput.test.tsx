import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "../MessageInput";
import { useChatStore } from "@/entities/chat/model/chatStore";

// Мокаем Zustand store
jest.mock("@/entities/chat/model/chatStore", () => ({
  useChatStore: jest.fn(),
}));

const mockUseChatStore = useChatStore as jest.MockedFunction<
  typeof useChatStore
>;

describe("MessageInput", () => {
  const mockSendMessage = jest.fn();

  beforeEach(() => {
    mockUseChatStore.mockImplementation((selector) => {
      return selector({ sendMessage: mockSendMessage } as any);
    });
    jest.clearAllMocks();
  });

  it("должен отображать поле ввода и кнопку отправки", () => {
    render(<MessageInput chatId="chat-1" />);

    expect(
      screen.getByPlaceholderText("Введите сообщение...")
    ).toBeInTheDocument();
    expect(screen.getByText("Отправить")).toBeInTheDocument();
  });

  it("должен отправлять сообщение при нажатии Enter", async () => {
    const user = userEvent.setup();

    render(<MessageInput chatId="chat-1" />);

    const input = screen.getByPlaceholderText("Введите сообщение...");
    await user.type(input, "Test message");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith("chat-1", "Test message");
    });
  });

  it("должен отправлять сообщение при клике на кнопку", async () => {
    const user = userEvent.setup();

    render(<MessageInput chatId="chat-1" />);

    const input = screen.getByPlaceholderText("Введите сообщение...");
    const button = screen.getByText("Отправить");

    await user.type(input, "Test message");
    await user.click(button);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith("chat-1", "Test message");
    });
  });

  it("должен очищать поле ввода после отправки", async () => {
    const user = userEvent.setup();
    mockUseChatStore.mockReturnValue(mockSendMessage);

    render(<MessageInput chatId="chat-1" />);

    const input = screen.getByPlaceholderText(
      "Введите сообщение..."
    ) as HTMLInputElement;
    await user.type(input, "Test message");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("не должен отправлять пустое сообщение", async () => {
    const user = userEvent.setup();

    render(<MessageInput chatId="chat-1" />);

    const button = screen.getByText("Отправить");
    expect(button).toBeDisabled();

    const input = screen.getByPlaceholderText("Введите сообщение...");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
