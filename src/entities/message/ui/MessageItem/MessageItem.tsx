import { FC } from "react";
import { formatTime } from "@/shared/utils";
import { Message } from "./types";

interface MessageItemProps extends Message {}

export const MessageItem: FC<MessageItemProps> = ({
  text,
  authorName,
  timestamp,
  isOwn,
}) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`
          max-w-[70%] rounded-lg px-4 py-2
          ${
            isOwn
              ? "bg-blue-600 text-white mr-4"
              : "bg-gray-200 text-gray-900 ml-4"
          }
        `}
      >
        {!isOwn && ( // TODO: убрать после адаптации моковых данных
          <div className="text-xs font-semibold mb-1 opacity-80">
            {authorName}
          </div>
        )}
        <div className="text-sm break-words">{text}</div>
        <div
          className={`
            text-xs mt-1
            ${isOwn ? "text-blue-100" : "text-gray-500"}
          `}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};
