import { create } from "zustand";

import { mockWebSocket } from "@/shared/mocks";
import { Message } from "@/entities/message/ui/MessageItem/types";
import { generateId } from "@/shared/utils";
import { getChats, getMessages } from "@/shared/api";
import { USER_ID } from "@/shared/mocks";

import { Chat } from "./types";

export interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isLoadingMoreMessages: boolean;
  isLoadingNewerMessages: boolean;
  hasMoreMessages: Record<string, boolean>;
  hasNewerMessages: Record<string, boolean>;
  error: string | null;

  // Actions
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  loadNewerMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, text: string) => void;
  addMessage: (message: Message) => void;
  updateChatLastMessage: (chatId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  activeChatId: null,
  isLoadingChats: false,
  isLoadingMessages: false,
  isLoadingMoreMessages: false,
  isLoadingNewerMessages: false,
  hasMoreMessages: {},
  hasNewerMessages: {},
  error: null,

  loadChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      mockWebSocket.disconnect();
      const chats = await getChats();
      set({ chats });

      // Подключаемся к WebSocket после загрузки чатов
      mockWebSocket.connect();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Ошибка загрузки чатов",
      });
    } finally {
      set({ isLoadingChats: false });
    }
  },

  selectChat: async (chatId: string) => {
    const { messages, activeChatId } = get();

    // Если чат уже выбран, ничего не делаем
    if (activeChatId === chatId) return;

    set({ activeChatId: chatId, error: null });

    // Если сообщения уже загружены, не загружаем повторно
    if (messages[chatId]) {
      return;
    }

    set({ isLoadingMessages: true });

    try {
      const result = await getMessages(chatId);

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: result.messages,
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [chatId]: result.hasMore,
        },
        hasNewerMessages: {
          ...state.hasNewerMessages,
          [chatId]: result.hasNewer,
        },
        isLoadingMessages: false,
      }));

      // Подписываемся на новые сообщения для этого чата
      mockWebSocket.subscribe(chatId, (message) => {
        get().addMessage(message);
        get().updateChatLastMessage(chatId, message);
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Ошибка загрузки сообщений",
        isLoadingMessages: false,
      });
    }
  },

  loadMoreMessages: async (chatId: string) => {
    const { messages, hasMoreMessages, isLoadingMoreMessages } = get();
    const chatMessages = messages[chatId] || [];

    // Проверяем, есть ли еще сообщения и не идет ли уже загрузка
    if (
      !hasMoreMessages[chatId] ||
      isLoadingMoreMessages ||
      chatMessages.length === 0
    ) {
      return;
    }

    // Находим самое старое сообщение (первое по timestamp)
    const oldestMessage = chatMessages.reduce((oldest, msg) =>
      msg.timestamp < oldest.timestamp ? msg : oldest
    );

    set({ isLoadingMoreMessages: true });
    try {
      const result = await getMessages(chatId, 10, oldestMessage.timestamp);

      set((state) => {
        const existingMessages = state.messages[chatId] || [];
        // Объединяем старые сообщения с новыми, избегая дубликатов
        const existingIds = new Set(existingMessages.map((m) => m.id));
        const newMessages = result.messages.filter(
          (m) => !existingIds.has(m.id)
        );

        return {
          messages: {
            ...state.messages,
            [chatId]: [...newMessages, ...existingMessages],
          },
          hasMoreMessages: {
            ...state.hasMoreMessages,
            [chatId]: result.hasMore,
          },
          isLoadingMoreMessages: false,
        };
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Ошибка загрузки сообщений",
        isLoadingMoreMessages: false,
      });
    }
  },

  loadNewerMessages: async (chatId: string) => {
    const { messages, hasNewerMessages, isLoadingNewerMessages } = get();
    const chatMessages = messages[chatId] || [];

    // Проверяем, есть ли еще сообщения и не идет ли уже загрузка
    if (
      !hasNewerMessages[chatId] ||
      isLoadingNewerMessages ||
      chatMessages.length === 0
    ) {
      return;
    }

    // Находим самое новое сообщение (последнее по timestamp)
    const newestMessage = chatMessages.reduce((newest, msg) =>
      msg.timestamp > newest.timestamp ? msg : newest
    );

    set({ isLoadingNewerMessages: true });
    try {
      const result = await getMessages(
        chatId,
        10,
        undefined,
        newestMessage.timestamp
      );

      set((state) => {
        const existingMessages = state.messages[chatId] || [];
        // Объединяем новые сообщения с существующими, избегая дубликатов
        const existingIds = new Set(existingMessages.map((m) => m.id));
        const newMessages = result.messages.filter(
          (m) => !existingIds.has(m.id)
        );

        return {
          messages: {
            ...state.messages,
            [chatId]: [...existingMessages, ...newMessages],
          },
          hasNewerMessages: {
            ...state.hasNewerMessages,
            [chatId]: result.hasNewer,
          },
          isLoadingNewerMessages: false,
        };
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Ошибка загрузки сообщений",
        isLoadingNewerMessages: false,
      });
    }
  },

  sendMessage: (chatId: string, text: string) => {
    if (!text.trim()) return;

    const message: Message = {
      id: generateId(),
      chatId,
      text: text.trim(),
      authorId: USER_ID,
      authorName: "Вы",
      timestamp: Date.now(),
      isOwn: true,
    };

    get().addMessage(message);
    get().updateChatLastMessage(chatId, message);
  },

  addMessage: (message: Message) => {
    set((state) => {
      const existingMessages = state.messages[message.chatId] || [];
      // Проверяем, нет ли уже такого сообщения (защита от дубликатов)
      if (existingMessages.some((m) => m.id === message.id)) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...existingMessages, message],
        },
      };
    });
  },

  updateChatLastMessage: (chatId: string, message: Message) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
            }
          : chat
      ),
    }));
  },
}));
