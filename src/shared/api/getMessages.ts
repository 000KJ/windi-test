import { Message } from "@/entities/message/ui/MessageItem/types";

import { delay, generateMockMessages } from "../utils";

// Кэш для хранения всех сгенерированных сообщений по чатам
const messagesCache: Record<string, Message[]> = {};

interface GetMessagesResult {
  messages: Message[];
  hasMore: boolean;
  hasNewer: boolean;
}

export const getMessages = async (
  chatId: string,
  limit: number = 10,
  beforeTimestamp?: number,
  afterTimestamp?: number
): Promise<GetMessagesResult> => {
  await delay(800);

  // Генерируем все сообщения один раз и кэшируем
  if (!messagesCache[chatId]) {
    messagesCache[chatId] = generateMockMessages(chatId, 5000);
  }

  const allMessages = messagesCache[chatId];

  // Фильтруем сообщения по временным меткам
  let filteredMessages = allMessages;

  if (beforeTimestamp !== undefined) {
    // Загрузка старых сообщений (скролл вверх)
    filteredMessages = allMessages.filter(
      (msg) => msg.timestamp < beforeTimestamp
    );
  } else if (afterTimestamp !== undefined) {
    // Загрузка новых сообщений (скролл вниз)
    filteredMessages = allMessages.filter(
      (msg) => msg.timestamp > afterTimestamp
    );
  }

  // Возвращаем нужное количество сообщений
  let resultMessages: Message[];
  let hasMore = false;
  let hasNewer = false;

  if (beforeTimestamp !== undefined) {
    // Загрузка старых сообщений (скролл вверх)
    // Берем последние limit сообщений (самые старые из отфильтрованных)
    resultMessages = filteredMessages.slice(-limit);
    // Проверяем, есть ли еще более старые сообщения
    hasMore = filteredMessages.length > limit;
    hasNewer = false; // При загрузке старых hasNewer не имеет смысла
  } else if (afterTimestamp !== undefined) {
    // Загрузка новых сообщений (скролл вниз)
    // Берем первые limit сообщений (самые новые из отфильтрованных)
    resultMessages = filteredMessages
      .slice(0, limit)
      .sort((a, b) => a.timestamp - b.timestamp);
    // Проверяем, есть ли еще более новые сообщения
    hasNewer = filteredMessages.length > limit;
    hasMore = false; // При загрузке новых hasMore не имеет смысла
  } else {
    // Первая загрузка - берем последние limit сообщений
    resultMessages = filteredMessages.slice(-limit);
    // Проверяем наличие сообщений до и после загруженного диапазона
    if (resultMessages.length > 0) {
      const oldestLoadedTimestamp = resultMessages[0].timestamp;
      const newestLoadedTimestamp =
        resultMessages[resultMessages.length - 1].timestamp;

      // Есть ли более старые сообщения
      hasMore = allMessages.some(
        (msg) => msg.timestamp < oldestLoadedTimestamp
      );
      // Есть ли более новые сообщения
      hasNewer = allMessages.some(
        (msg) => msg.timestamp > newestLoadedTimestamp
      );
    } else {
      // Если нет сообщений, то и hasMore/hasNewer нет
      hasMore = false;
      hasNewer = false;
    }
  }

  return {
    messages: resultMessages,
    hasMore,
    hasNewer,
  };
};
