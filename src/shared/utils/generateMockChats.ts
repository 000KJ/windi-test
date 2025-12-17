import { Chat } from "@/entities/chat/model/types";
import { CHAT_NAMES, OLD_MESSAGE_TEXTS } from "@/shared/mocks";

export function generateMockChats(): Chat[] {
  const now = Date.now();
  const chats: Chat[] = [];

  for (let i = 0; i < CHAT_NAMES.length; i++) {
    const chatId = `chat-${i + 1}`;
    const lastMessage =
      OLD_MESSAGE_TEXTS[Math.floor(Math.random() * OLD_MESSAGE_TEXTS.length)];
    const lastMessageTime = now - Math.random() * 7 * 24 * 60 * 60 * 1000; // последние 7 дней

    chats.push({
      id: chatId,
      name: CHAT_NAMES[i],
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
      lastMessage,
      lastMessageTime,
    });
  }

  return chats;
}
