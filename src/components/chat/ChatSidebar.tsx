
import { Search, Users } from "lucide-react";
import { RecentChat } from "@/types/chat";

interface ChatSidebarProps {
  recentChats: RecentChat[];
  selectedChat: number | null;
  onSelectChat: (chatId: number) => void;
}

export const ChatSidebar = ({ recentChats, selectedChat, onSelectChat }: ChatSidebarProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats"
            className="w-full pl-10 p-2 rounded-full bg-secondary border-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {recentChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center gap-3 p-4 hover:bg-secondary transition-colors cursor-pointer ${
              selectedChat === chat.id ? "bg-secondary" : ""
            }`}
          >
            <div className={`relative ${chat.hasStatus ? 'status-ring' : ''}`}>
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full relative z-10 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate">{chat.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatTime(chat.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
                {chat.unreadCount && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
