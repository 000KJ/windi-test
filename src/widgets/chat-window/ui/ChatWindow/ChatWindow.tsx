import { FC } from "react";
import { useShallow } from "zustand/shallow";

import { useChatStore } from "@/entities/chat/model/chatStore";
import { VirtualizedMessageList, MessageInput } from "@/features";

export const ChatWindow: FC = () => {
  const { activeChatId, messages, isLoadingMessages } = useChatStore(
    useShallow((state) => ({
      activeChatId: state.activeChatId,
      messages: state.messages,
      isLoadingMessages: state.isLoadingMessages,
    }))
  );

  if (!activeChatId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Выберите чат для начала общения
      </div>
    );
  }

  const chatMessages = messages[activeChatId] || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Загрузка сообщений...</div>
          </div>
        ) : (
          <VirtualizedMessageList
            messages={chatMessages}
            chatId={activeChatId}
          />
        )}
      </div>
      <MessageInput chatId={activeChatId} />
    </div>
  );
};
