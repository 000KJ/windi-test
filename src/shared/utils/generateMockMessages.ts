import { Message } from "@/entities/message/ui/MessageItem/types";

import { generateRandomMessage } from "./generateRandomMessage";

export function generateMockMessages(
  chatId: string,
  count: number = 5000
): Message[] {
  const messages: Message[] = [];
  const now = Date.now();
  const startTime = now - 30 * 24 * 60 * 60 * 1000; // последние 30 дней

  for (let i = 0; i < count; i++) {
    const timestamp = startTime + (i * (now - startTime)) / count;
    const isOwn = Math.random() > 0.5; // 50% своих сообщений
    messages.push(generateRandomMessage(chatId, isOwn, timestamp));
  }

  // Сортируем по времени (старые первыми)
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}
