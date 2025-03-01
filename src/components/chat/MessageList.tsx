import { Message } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { CheckCheck, Clock, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const handleImageLoad = (messageId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [messageId]: true
    }));
  };

  const isMessageToday = (date: string) => {
    const today = new Date().toLocaleDateString();
    return date === today;
  };

  const isMessageYesterday = (date: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date === yesterday.toLocaleDateString();
  };

  const getFormattedDate = (date: string) => {
    if (isMessageToday(date)) {
      return 'Today';
    } else if (isMessageYesterday(date)) {
      return 'Yesterday';
    } else {
      return new Date(date).toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-6"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='20' fill='%23E2E8F0' opacity='0.07'%3E💬 💭 ✨%3C/text%3E%3C/svg%3E")`,
        backgroundColor: 'var(--secondary)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date} className="space-y-4">
          <div className="flex justify-center">
            <span className="px-3 py-1 text-xs bg-secondary/80 backdrop-blur-sm rounded-full text-muted-foreground shadow-sm">
              {getFormattedDate(group.date)}
            </span>
          </div>
          
          {group.messages.map((message, messageIndex) => {
            const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null;
            const isSequence = prevMessage && prevMessage.sender_id === message.sender_id;
            
            const nextMessage = messageIndex < group.messages.length - 1 ? group.messages[messageIndex + 1] : null;
            const isNextFromSameSender = nextMessage && nextMessage.sender_id === message.sender_id;
            
            let borderRadiusClass = "";
            if (message.sent) {
              borderRadiusClass = isSequence 
                ? (isNextFromSameSender ? "rounded-tr-none rounded-br-none" : "rounded-tr-none") 
                : (isNextFromSameSender ? "rounded-br-none" : "");
            } else {
              borderRadiusClass = isSequence 
                ? (isNextFromSameSender ? "rounded-tl-none rounded-bl-none" : "rounded-tl-none") 
                : (isNextFromSameSender ? "rounded-bl-none" : "");
            }
            
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
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-secondary text-secondary-foreground'
                  } ${borderRadiusClass} shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fade-up`}
                  style={{ 
                    animationDelay: `${messageIndex * 50}ms`,
                    animationDuration: '300ms'
                  }}
                >
                  {message.is_sticker ? (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <img 
                          src={message.sticker_url} 
                          alt="Sticker" 
                          className={`max-w-[150px] max-h-[150px] object-contain rounded-lg hover:scale-110 transition-transform duration-200 ${
                            !imagesLoaded[message.id] ? 'opacity-0' : 'opacity-100'
                          }`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(message.id)}
                        />
                        {!imagesLoaded[message.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 rounded-lg">
                            <Image className="w-6 h-6 text-muted-foreground animate-pulse" />
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(message.sticker_url, '_blank')}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                      <span className="text-xs opacity-70 mt-1 self-end">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="break-words">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatMessageTime(message.timestamp)}
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
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-60">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Image className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start the conversation by sending a message, sticker, or media file.
          </p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
