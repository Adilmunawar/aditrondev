
import { useState } from "react";
import { Message, RecentChat } from "@/types/chat";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! Welcome to Aditron! 👋", sent: false, timestamp: new Date() },
    { id: 2, text: "Thanks! Love the design! ❤️", sent: true, timestamp: new Date() },
  ]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  // Mock data for recent chats with status and profile pictures
  const recentChats: RecentChat[] = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "See you tomorrow! 👋",
      timestamp: new Date(),
      unreadCount: 3,
      avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
      hasStatus: true
    },
    {
      id: 2,
      name: "Team Aditron",
      lastMessage: "Great work everyone! 🎉",
      timestamp: new Date(Date.now() - 3600000),
      avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      hasStatus: true
    },
    {
      id: 3,
      name: "Alice Johnson",
      lastMessage: "The meeting is confirmed ✅",
      timestamp: new Date(Date.now() - 7200000),
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    }
  ];

  const handleSendMessage = (text: string) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text,
        sent: true,
        timestamp: new Date(),
      },
    ]);
  };

  const selectedChatDetails = recentChats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-full flex bg-background rounded-xl overflow-hidden shadow-lg">
      <ChatSidebar
        recentChats={recentChats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <ChatHeader selectedChat={selectedChatDetails} />
          <MessageList messages={messages} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-secondary/50">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-primary">Welcome to Aditron</h1>
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};
