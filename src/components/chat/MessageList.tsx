
import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";
import { CheckCheck, Clock } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date for better organization
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((acc, message) => {
    const messageDate = new Date(message.timestamp).toLocaleDateString();
    const existingGroup = acc.find(group => group.date === messageDate);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      acc.push({ date: messageDate, messages: [message] });
    }
    
    return acc;
  }, []);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-6"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='20' fill='%23E2E8F0' opacity='0.1'%3E💬 💭 ✨%3C/text%3E%3C/svg%3E")`,
        backgroundColor: 'var(--secondary)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date} className="space-y-4">
          <div className="flex justify-center">
            <span className="px-3 py-1 text-xs bg-secondary/80 rounded-full text-muted-foreground">
              {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            // Check if this message is part of a sequence from same sender
            const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null;
            const isSequence = prevMessage && prevMessage.sender_id === message.sender_id;
            
            return (
              <div
                key={message.id}
                className={`flex ${message.sent ? 'justify-end' : 'justify-start'} ${
                  isSequence ? 'mt-1' : 'mt-4'
                }`}
              >
                <div
                  className={`message-bubble max-w-[80%] p-3 rounded-2xl ${
                    message.sent
                      ? 'bg-primary text-primary-foreground ml-auto rounded-tr-none'
                      : 'bg-secondary text-secondary-foreground rounded-tl-none'
                  } shadow-lg hover:scale-[1.02] transition-transform duration-200 animate-fade-up`}
                  style={{ 
                    animationDelay: `${messageIndex * 50}ms`,
                    animationDuration: '300ms'
                  }}
                >
                  {message.is_sticker ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={message.sticker_url} 
                        alt="Sticker" 
                        className="max-w-[150px] max-h-[150px] object-contain rounded-lg hover:scale-110 transition-transform duration-200"
                        loading="lazy"
                      />
                      <span className="text-xs opacity-70 mt-1 self-end">
                        {new Intl.DateTimeFormat('default', {
                          hour: 'numeric',
                          minute: 'numeric'
                        }).format(message.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="break-words">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Intl.DateTimeFormat('default', {
                            hour: 'numeric',
                            minute: 'numeric'
                          }).format(message.timestamp)}
                        </span>
                        {message.sent && (
                          <span className="text-xs">
                            {message.read ? (
                              <CheckCheck className="w-3 h-3 text-primary" />
                            ) : (
                              <Clock className="w-3 h-3 text-muted-foreground" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
