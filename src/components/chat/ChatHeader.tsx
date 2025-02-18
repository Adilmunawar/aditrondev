
import { Users } from "lucide-react";
import { RecentChat } from "@/types/chat";

interface ChatHeaderProps {
  selectedChat: RecentChat | undefined;
}

export const ChatHeader = ({ selectedChat }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={`relative ${selectedChat?.hasStatus ? 'status-ring' : ''}`}>
          {selectedChat?.avatar ? (
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full relative z-10 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
              <Users className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <h2 className="font-semibold">
          {selectedChat ? selectedChat.name : "Select a chat"}
        </h2>
      </div>
    </div>
  );
};
