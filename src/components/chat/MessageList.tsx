
import { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='20' fill='%23E2E8F0' opacity='0.1'%3E💬 💭 ✨%3C/text%3E%3C/svg%3E")`,
        backgroundColor: 'var(--secondary)',
        backgroundBlendMode: 'overlay'
      }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`message-bubble max-w-[80%] p-3 rounded-2xl ${
              message.sent
                ? 'bg-primary text-primary-foreground ml-auto rounded-tr-none'
                : 'bg-secondary text-secondary-foreground rounded-tl-none'
            } shadow-lg hover:scale-[1.02] transition-transform duration-200`}
          >
            {message.is_sticker ? (
              <img 
                src={message.sticker_url} 
                alt="Sticker" 
                className="max-w-[120px] max-h-[120px] object-contain rounded-lg hover:scale-110 transition-transform duration-200"
              />
            ) : (
              <div className="relative">
                <p className="break-words">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Intl.DateTimeFormat('default', {
                    hour: 'numeric',
                    minute: 'numeric'
                  }).format(message.timestamp)}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
