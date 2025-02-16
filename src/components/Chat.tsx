
import { useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sent: boolean;
  timestamp: Date;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! Welcome to Aditron!", sent: false, timestamp: new Date() },
    { id: 2, text: "Thanks! Love the design!", sent: true, timestamp: new Date() },
  ]);
  const [newMessage, setNewMessage] = useState("");

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

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <h2 className="font-semibold">Aditron Chat</h2>
      </div>

      {/* Messages */}
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

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white/50 backdrop-blur-sm border-t">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="submit"
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
