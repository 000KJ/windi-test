import { FC } from "react";

import { Avatar } from "@/shared/ui";
import { formatTime } from "@/shared/utils";

import { Chat } from "../../model";

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatItem: FC<ChatItemProps> = ({ chat, isActive, onClick }) => {
  const { avatar, name, lastMessage, lastMessageTime } = chat;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 cursor-pointer transition-colors
        p-2 md:p-4
        justify-center md:justify-start
        ${
          isActive
            ? "bg-blue-50 border-l-4 border-blue-600"
            : "hover:bg-gray-50"
        }
      `}
    >
      <div className="relative flex-shrink-0">
        <Avatar src={avatar} alt={name} size="md" />
      </div>
      {/* Контент чата - скрыт в mobile, виден на tablet и desktop */}
      <div className="flex-1 min-w-0 hidden md:block">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTime(lastMessageTime)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
        )}
      </div>
    </div>
  );
};
