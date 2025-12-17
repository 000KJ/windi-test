import { Message } from "@/entities/message/ui/MessageItem/types";
import { CHAT_NAMES, OLD_MESSAGE_TEXTS, USER_ID } from "@/shared/mocks";

import { generateId } from "./generateId";

export function generateRandomMessage(
  chatId: string,
  isOwn: boolean,
  timestamp: number
): Message {
  const text =
    OLD_MESSAGE_TEXTS[Math.floor(Math.random() * OLD_MESSAGE_TEXTS.length)];
  const authorId = isOwn ? USER_ID : `author-${chatId}`;
  const authorName = isOwn
    ? "Вы"
    : CHAT_NAMES.find((_, i) => chatId === `chat-${i + 1}`) || "Собеседник";

  return {
    id: generateId(),
    chatId,
    text,
    authorId,
    authorName,
    timestamp,
    isOwn,
  };
}
