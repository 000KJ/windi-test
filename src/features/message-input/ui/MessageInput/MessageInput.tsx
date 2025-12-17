import { FC, useState, FormEvent } from "react";
import { Input, Button } from "@/shared/ui";
import { useChatStore } from "@/entities/chat/model/chatStore";

interface MessageInputProps {
  chatId: string;
}

export const MessageInput: FC<MessageInputProps> = ({ chatId }) => {
  const [text, setText] = useState("");
  const sendMessage = useChatStore((state) => state.sendMessage);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(chatId, text);
      setText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 border-t border-gray-200"
    >
      <Input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите сообщение..."
        className="flex-1"
      />
      <Button type="submit" disabled={!text.trim()}>
        Отправить
      </Button>
    </form>
  );
};
