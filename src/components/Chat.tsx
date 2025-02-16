
import { useState } from "react";
import { Send, Paperclip, Smile, Users } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sent: boolean;
  timestamp: Date;
}

interface RecentChat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
  avatar?: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! Welcome to Aditron!", sent: false, timestamp: new Date() },
    { id: 2, text: "Thanks! Love the design!", sent: true, timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  // Mock data for recent chats
  const recentChats: RecentChat[] = [
    {
      id: 1,
      name: "John Doe",
      lastMessage: "See you tomorrow!",
      timestamp: new Date(),
      unreadCount: 3
    },
    {
      id: 2,
      name: "Team Aditron",
      lastMessage: "Great work everyone!",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      name: "Alice Johnson",
      lastMessage: "The meeting is confirmed",
      timestamp: new Date(Date.now() - 7200000),
    }
  ];

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: newMessage,
        sent: true,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="h-full flex">
      {/* Recent Chats Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
          <h2 className="font-semibold">Recent Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {recentChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`flex items-center gap-3 p-4 hover:bg-secondary transition-colors cursor-pointer ${
                selectedChat === chat.id ? "bg-secondary" : ""
              }`}
            >
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              )}
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
                    <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
          <h2 className="font-semibold">Aditron Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.sent ? "message-bubble-sent" : "message-bubble-received"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-card/50 backdrop-blur-sm border-t">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-secondary p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="submit"
              className="p-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
