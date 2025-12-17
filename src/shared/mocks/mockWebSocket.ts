import { Message } from "@/entities/message/ui/MessageItem/types";
import { generateId } from "@/shared/utils";

import { NEW_MESSAGE_TEXTS } from "./mockData";

type MessageHandler = (message: Message) => void;

export class MockWebSocket {
  private handlers: Map<string, MessageHandler> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private isConnected = false;

  connect(): void {
    if (this.isConnected) return;

    this.isConnected = true;
    // Имитация получения сообщений каждые 3-7 секунд
    this.intervalId = setInterval(() => {
      this.emitRandomMessage();
    }, 3000 + Math.random() * 4000);
  }

  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
  }

  subscribe(chatId: string, handler: MessageHandler): () => void {
    this.handlers.set(chatId, handler);
    return () => {
      this.handlers.delete(chatId);
    };
  }

  private emitRandomMessage(): void {
    if (this.handlers.size === 0) return;

    // Выбираем случайный активный чат
    const chatIds = Array.from(this.handlers.keys());
    const randomChatId = chatIds[Math.floor(Math.random() * chatIds.length)];
    const handler = this.handlers.get(randomChatId);

    if (handler) {
      const message: Message = {
        id: generateId(),
        chatId: randomChatId,
        text: NEW_MESSAGE_TEXTS[
          Math.floor(Math.random() * NEW_MESSAGE_TEXTS.length)
        ],
        authorId: `author-${randomChatId}`,
        authorName: "Собеседник",
        timestamp: Date.now(),
        isOwn: false,
      };

      handler(message);
    }
  }
}

export const mockWebSocket = new MockWebSocket();
