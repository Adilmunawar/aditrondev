
import { useState } from "react";
import { Send, Paperclip, Smile, Users, Search } from "lucide-react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

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
  hasStatus?: boolean;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! Welcome to Aditron! 👋", sent: false, timestamp: new Date() },
    { id: 2, text: "Thanks! Love the design! ❤️", sent: true, timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const addEmoji = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const selectedChatDetails = recentChats.find(chat => chat.id === selectedChat);

  return (
    <div className="h-full flex bg-background rounded-xl overflow-hidden shadow-lg">
      {/* Recent Chats Sidebar */}
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
              onClick={() => setSelectedChat(chat.id)}
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`relative ${selectedChatDetails?.hasStatus ? 'status-ring' : ''}`}>
              {selectedChatDetails?.avatar ? (
                <img
                  src={selectedChatDetails.avatar}
                  alt={selectedChatDetails.name}
                  className="w-10 h-10 rounded-full relative z-10 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
            <h2 className="font-semibold">
              {selectedChatDetails ? selectedChatDetails.name : "Select a chat"}
            </h2>
          </div>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='20' fill='%23E2E8F0' opacity='0.2'%3E💬 💭 ✨%3C/text%3E%3C/svg%3E")`,
            backgroundColor: 'var(--secondary)',
            backgroundBlendMode: 'overlay'
          }}
        >
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
              className="p-2 hover:bg-secondary rounded-full transition-all duration-300 transform hover:scale-110"
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-secondary rounded-full transition-all duration-300 transform hover:scale-110"
              >
                <Smile className="w-5 h-5 text-muted-foreground" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2">
                  <Picker data={data} onEmojiSelect={addEmoji} />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="p-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full transition-all duration-300 transform hover:scale-110"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
