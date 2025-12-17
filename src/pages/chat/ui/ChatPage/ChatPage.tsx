import { FC } from "react";

import { ChatList, ChatWindow } from "@/widgets";

export const ChatPage: FC = () => (
  <div
    className="h-screen grid bg-gray-50 
    grid-cols-[80px_minmax(400px,1fr)] 
    md:grid-cols-[320px_minmax(400px,2fr)] 
    lg:grid-cols-[320px_minmax(400px,3fr)]"
  >
    {/* Sidebar - список чатов */}
    <div className="border-r border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Заголовок - скрыт на мобильных, виден на tablet и desktop */}
      <div className="p-4 border-b border-gray-200 hidden md:block">
        <h1 className="text-xl font-bold text-gray-900">Чаты</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatList />
      </div>
    </div>
    {/* Main content - экран сообщений */}
    <div className="flex flex-col bg-white min-w-0">
      <ChatWindow />
    </div>
  </div>
);
