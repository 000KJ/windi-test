import { FC, useEffect } from "react";

import { useChatStore } from "@/entities/chat/model/chatStore";
import { ChatItem } from "@/entities/chat/ui/ChatItem";

export const ChatList: FC = () => {
  const { chats, activeChatId, isLoadingChats, loadChats, selectChat } =
    useChatStore((state) => state);

  useEffect(() => {
    loadChats();
  }, []);

  if (isLoadingChats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Загрузка чатов...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* TODO: сделать виртуализацию списка чатов */}
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => selectChat(chat.id)}
        />
      ))}
    </div>
  );
};
